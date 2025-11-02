'use client';

import { Providers } from '../(main)/providers';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <div className="auth-layout flex-1">
                {children}
            </div>
        </Providers>
    )
}