<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->ensureSqliteDatabaseExists();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->ensureMemberPlanColumns();
        $this->ensureTrainerRequestsTable();
        $this->ensureTrainerUserLinks();
        $this->ensureDefaultTrainerUsers();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        if (app()->isProduction()) {
            URL::forceScheme('https');
        }

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function ensureSqliteDatabaseExists(): void
    {
        if (config('database.default') !== 'sqlite') {
            return;
        }

        $database = config('database.connections.sqlite.database');

        if (!is_string($database) || $database === ':memory:') {
            return;
        }

        if (!$this->isAbsolutePath($database)) {
            $database = base_path($database);

            config([
                'database.connections.sqlite.database' => $database,
            ]);
        }

        $directory = dirname($database);

        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        if (!file_exists($database)) {
            touch($database);
        }
    }

    protected function isAbsolutePath(string $path): bool
    {
        return str_starts_with($path, '/')
            || preg_match('/^[A-Za-z]:[\/\\\\]/', $path) === 1;
    }

    protected function ensureMemberPlanColumns(): void
    {
        if (!Schema::hasTable('members')) {
            return;
        }

        if (!Schema::hasColumn('members', 'plan_started_at')) {
            Schema::table('members', function ($table) {
                $table->timestamp('plan_started_at')->nullable()->after('plan');
            });
        }

        if (!Schema::hasColumn('members', 'pending_plan')) {
            Schema::table('members', function ($table) {
                $table->string('pending_plan')->nullable()->after('plan_started_at');
            });
        }

        if (!Schema::hasColumn('members', 'plan_status')) {
            Schema::table('members', function ($table) {
                $table->string('plan_status')->default('active')->after('pending_plan');
            });
        }
    }

    protected function ensureTrainerRequestsTable(): void
    {
        if (!Schema::hasTable('members') || Schema::hasTable('trainer_requests')) {
            return;
        }

        Schema::create('trainer_requests', function ($table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('requested_trainer_id');
            $table->string('requested_trainer');
            $table->foreignId('requested_trainer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('assigned_trainer_id')->nullable();
            $table->string('assigned_trainer')->nullable();
            $table->foreignId('assigned_trainer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('Pending');
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });
    }

    protected function ensureTrainerUserLinks(): void
    {
        if (!Schema::hasTable('users')) {
            return;
        }

        if (!Schema::hasColumn('users', 'trainer_profile_id')) {
            Schema::table('users', function ($table) {
                $table->unsignedInteger('trainer_profile_id')->nullable()->unique()->after('role');
            });
        }

        if (!Schema::hasTable('trainer_requests')) {
            return;
        }

        if (!Schema::hasColumn('trainer_requests', 'requested_trainer_user_id')) {
            Schema::table('trainer_requests', function ($table) {
                $table->foreignId('requested_trainer_user_id')
                    ->nullable()
                    ->after('requested_trainer')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }

        if (!Schema::hasColumn('trainer_requests', 'assigned_trainer_user_id')) {
            Schema::table('trainer_requests', function ($table) {
                $table->foreignId('assigned_trainer_user_id')
                    ->nullable()
                    ->after('assigned_trainer')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }
    }

    protected function ensureDefaultTrainerUsers(): void
    {
        if (!Schema::hasTable('users') || !Schema::hasColumn('users', 'trainer_profile_id')) {
            return;
        }

        $now = now();

        foreach ($this->defaultTrainerUsers() as $trainer) {
            $existingTrainer = DB::table('users')->where('email', $trainer['email'])->first();

            if ($existingTrainer) {
                DB::table('users')
                    ->where('id', $existingTrainer->id)
                    ->update([
                        'name' => $trainer['name'],
                        'role' => 'trainer',
                        'trainer_profile_id' => $trainer['profile_id'],
                        'updated_at' => $now,
                    ]);

                continue;
            }

            DB::table('users')->insert([
                'name' => $trainer['name'],
                'email' => $trainer['email'],
                'role' => 'trainer',
                'trainer_profile_id' => $trainer['profile_id'],
                'email_verified_at' => $now,
                'password' => Hash::make('password'),
                'updated_at' => $now,
                'created_at' => $now,
            ]);
        }
    }

    /**
     * @return array<int, array{name: string, email: string, profile_id: int}>
     */
    protected function defaultTrainerUsers(): array
    {
        return [
            ['profile_id' => 1, 'name' => 'John Cena', 'email' => 'john.cena@gymfit.test'],
            ['profile_id' => 2, 'name' => 'The Rock', 'email' => 'the.rock@gymfit.test'],
            ['profile_id' => 3, 'name' => 'Arnold Schwarzenegger', 'email' => 'arnold.schwarzenegger@gymfit.test'],
            ['profile_id' => 4, 'name' => 'Sylvester Gardenzio Stallone', 'email' => 'sylvester.stallone@gymfit.test'],
            ['profile_id' => 5, 'name' => 'Ma Dong-seok', 'email' => 'ma.dong-seok@gymfit.test'],
        ];
    }

}
