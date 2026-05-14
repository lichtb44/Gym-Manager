<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
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
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

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
}
