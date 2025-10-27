'use client';

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

interface ErrorStateProps {
    error: string;
    mangaId: number;
    onBack: () => void;
}

export function ErrorState({ error, mangaId, onBack }: ErrorStateProps) {
    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 max-w-md">
                <CardBody className="p-6">
                    <p className="text-red-600 dark:text-red-400 mb-4">
                        {error || '无法加载漫画数据'}
                    </p>
                    <Button
                        color="primary"
                        onPress={onBack}
                    >
                        返回详情页
                    </Button>
                </CardBody>
            </Card>
        </div>
    );
}

