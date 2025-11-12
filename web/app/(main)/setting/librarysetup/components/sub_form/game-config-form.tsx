'use client';

import clsx from "clsx";
import {Select, SelectItem} from "@heroui/select";
import {Chip} from "@heroui/chip";
import {Tab, Tabs} from "@heroui/tabs";
import {Card, CardBody} from "@heroui/card";
import {useState} from "react";

interface GameConfigFormProps {
    gameProviders?: string[];
    onGameProvidersChange?: (providers: string[]) => void;
    metadataStorage?: string;
    onMetadataStorageChange?: (value: string) => void;
}

export function GameConfigForm({
    gameProviders = ["igdb", "dlsite"],
    onGameProvidersChange,
    metadataStorage = "database",
    onMetadataStorageChange,
}: GameConfigFormProps) {
    const [internalGameProviders, setInternalGameProviders] = useState<string[]>(gameProviders);
    const [internalMetadataStorage, setInternalMetadataStorage] = useState<string>(metadataStorage);

    const handleProvidersChange = (keys: any) => {
        const selected = Array.from(keys as Set<string>);
        setInternalGameProviders(selected);
        onGameProvidersChange?.(selected);
    };

    const handleMetadataStorageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setInternalMetadataStorage(value);
        onMetadataStorageChange?.(value);
    };

    return (
        <div className="flex w-full flex-col">
            <Tabs aria-label="游戏配置选项">
                <Tab key="game-provider" title="游戏数据库提供者">
                    <Card>
                        <CardBody className="gap-4">
                            <Select
                                label="游戏数据库提供者"
                                placeholder="选择游戏数据库"
                                className="w-full"
                                description="用于获取游戏元数据和封面（可多选）"
                                selectionMode="multiple"
                                selectedKeys={internalGameProviders}
                                onSelectionChange={handleProvidersChange}
                                renderValue={(items) => {
                                    return (
                                        <div className="flex flex-wrap gap-2">
                                            {items.map((item) => (
                                                <Chip
                                                    key={item.key}
                                                    size="sm"
                                                    color="primary"
                                                    variant="flat"
                                                >
                                                    {item.key === "igdb" ? "IGDB" :
                                                        item.key === "dlsite" ? "DLsite" :
                                                            item.key === "steamdb" ? "SteamDB" : item.textValue}
                                                </Chip>
                                            ))}
                                        </div>
                                    );
                                }}
                            >
                                <SelectItem
                                    key="igdb"
                                    textValue="IGDB"
                                    description="全球最大的游戏数据库，支持主流游戏平台"
                                >
                                    IGDB
                                </SelectItem>
                                <SelectItem
                                    key="dlsite"
                                    textValue="DLsite"
                                    description="日本同人游戏平台，丰富的日式RPG游戏（⚠️使用此库需要VPN）"
                                >
                                    DLsite
                                </SelectItem>
                                <SelectItem
                                    key="steamdb"
                                    textValue="SteamDB"
                                    description="Steam 游戏数据库，适合 PC 游戏"
                                >
                                    SteamDB
                                </SelectItem>
                            </Select>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="metadata-store" title="元数据存储方式">
                    <Card>
                        <CardBody className="gap-4">
                            <Select
                                label="元数据存储方式"
                                placeholder="选择存储方式"
                                className="w-full"
                                description="选择如何存储游戏元数据"
                                selectedKeys={internalMetadataStorage ? [internalMetadataStorage] : []}
                                onChange={handleMetadataStorageChange}
                            >
                                <SelectItem key="local">本地存储</SelectItem>
                                <SelectItem key="database">数据库存储</SelectItem>
                                <SelectItem key="mixed">混合存储</SelectItem>
                            </Select>
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
}