import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M8 25.5a4 4 0 0 1 4-4h2v21h-2a4 4 0 0 1-4-4v-13Zm10-7a4 4 0 0 1 4-4h4v35h-4a4 4 0 0 1-4-4v-27Zm12 10h4v7h-4v-7Zm8-14h4a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4h-4v-35Zm12 7h2a4 4 0 0 1 4 4v13a4 4 0 0 1-4 4h-2v-21Z"
            />
        </svg>
    );
}
