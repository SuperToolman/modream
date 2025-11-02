'use client';

export function LoadingState() {
    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">加载中...</p>
            </div>
        </div>
    );
}

