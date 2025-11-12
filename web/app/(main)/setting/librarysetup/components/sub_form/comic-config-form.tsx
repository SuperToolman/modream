'use client';

import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Tab, Tabs } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { useState } from "react";

interface ComicConfigFormProps {
  metadataStorage?: string;
  onMetadataStorageChange?: (value: string) => void;
  comicFormats?: string[];
  onComicFormatsChange?: (formats: string[]) => void;
}

export function ComicConfigForm({
  metadataStorage = "database",
  onMetadataStorageChange,
  comicFormats = ["cbz", "cbr"],
  onComicFormatsChange,
}: ComicConfigFormProps) {
  const [internalFormats, setInternalFormats] = useState<string[]>(comicFormats);
  const [internalMetadataStorage, setInternalMetadataStorage] = useState<string>(metadataStorage);

  const handleFormatsChange = (keys: any) => {
    const selected = Array.from(keys as Set<string>);
    setInternalFormats(selected);
    onComicFormatsChange?.(selected);
  };

  const handleMetadataStorageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setInternalMetadataStorage(value);
    onMetadataStorageChange?.(value);
  };

  return (
    <div className="flex w-full flex-col">
      <Tabs aria-label="漫画配置选项">
        <Tab key="metadata-store" title="元数据存储方式">
          <Card>
            <CardBody className="gap-4">
              <Select
                label="元数据存储方式"
                placeholder="选择存储方式"
                className="w-full"
                description="选择如何存储漫画元数据"
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

        <Tab key="formats" title="支持的漫画格式">
          <Card>
            <CardBody className="gap-4">
              <Select
                label="支持的漫画格式"
                placeholder="选择支持的格式"
                className="w-full"
                selectionMode="multiple"
                description="选择要扫描的漫画文件格式"
                selectedKeys={internalFormats}
                onSelectionChange={handleFormatsChange}
                renderValue={(items) => {
                  return (
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => (
                        <Chip
                          key={item.key}
                          size="sm"
                          color="secondary"
                          variant="flat"
                        >
                          {item.textValue}
                        </Chip>
                      ))}
                    </div>
                  );
                }}
              >
                <SelectItem key="cbz" textValue="CBZ">CBZ (ZIP压缩)</SelectItem>
                <SelectItem key="cbr" textValue="CBR">CBR (RAR压缩)</SelectItem>
                <SelectItem key="pdf" textValue="PDF">PDF</SelectItem>
                <SelectItem key="epub" textValue="EPUB">EPUB</SelectItem>
              </Select>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

