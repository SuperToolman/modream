'use client';

import { memo } from 'react';
import clsx from "clsx";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { formatDate } from "@/lib/utils/format";
import type { PhotoExif } from "@/types/photo";

interface PhotoExifPanelProps {
  exif: PhotoExif | null;
  isDark: boolean;
  themeStyles: {
    cardBg: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
  };
}

/**
 * 信息行组件
 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 group">
      <span className="text-gray-500 dark:text-gray-400 min-w-[100px] font-medium text-xs uppercase tracking-wide">
        {label}
      </span>
      <span className="text-gray-900 dark:text-white text-right flex-1 break-all font-mono text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {value}
      </span>
    </div>
  );
}

/**
 * EXIF 信息面板组件
 * 显示照片的 EXIF 元数据信息
 */
function PhotoExifPanel({ exif, isDark, themeStyles }: PhotoExifPanelProps) {
  // 如果没有 EXIF 信息，显示提示
  if (!exif) {
    return (
      <Card className={clsx("backdrop-blur-md border", themeStyles.cardBg, themeStyles.border)}>
        <CardBody className="text-center py-8">
          <p className={clsx("text-lg", themeStyles.textTertiary)}>📷 此照片没有 EXIF 信息</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={clsx("backdrop-blur-md border", themeStyles.cardBg, themeStyles.border)}>
      <CardHeader className="pb-3">
        <h3 className={clsx("text-lg font-bold", themeStyles.textPrimary)}>📷 EXIF 信息</h3>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="space-y-4 text-sm">
          {/* 相机信息 */}
          {(exif.camera_make || exif.camera_model) && (
            <div className={clsx("p-3 rounded-lg", isDark ? "bg-white/5" : "bg-gray-100")}>
              <p className={clsx("font-semibold mb-2", themeStyles.textSecondary)}>📸 相机</p>
              <div className="space-y-2 pl-3">
                {exif.camera_make && <InfoRow label="制造商" value={exif.camera_make} />}
                {exif.camera_model && <InfoRow label="型号" value={exif.camera_model} />}
                {exif.software && <InfoRow label="软件" value={exif.software} />}
              </div>
            </div>
          )}

          {/* 拍摄参数 */}
          {(exif.f_number || exif.exposure_time || exif.iso_speed) && (
            <div className={clsx("p-3 rounded-lg", isDark ? "bg-white/5" : "bg-gray-100")}>
              <p className={clsx("font-semibold mb-2", themeStyles.textSecondary)}>⚙️ 拍摄参数</p>
              <div className="space-y-2 pl-3">
                {exif.f_number && <InfoRow label="光圈" value={`f/${exif.f_number}`} />}
                {exif.exposure_time && <InfoRow label="快门速度" value={exif.exposure_time} />}
                {exif.iso_speed && <InfoRow label="ISO" value={exif.iso_speed.toString()} />}
                {exif.focal_length && <InfoRow label="焦距" value={`${exif.focal_length}mm`} />}
                {exif.focal_length_in_35mm && <InfoRow label="等效焦距" value={`${exif.focal_length_in_35mm}mm (35mm)`} />}
              </div>
            </div>
          )}

          {/* 镜头信息 */}
          {(exif.lens_make || exif.lens_model) && (
            <div className={clsx("p-3 rounded-lg", isDark ? "bg-white/5" : "bg-gray-100")}>
              <p className={clsx("font-semibold mb-2", themeStyles.textSecondary)}>🔍 镜头</p>
              <div className="space-y-2 pl-3">
                {exif.lens_make && <InfoRow label="制造商" value={exif.lens_make} />}
                {exif.lens_model && <InfoRow label="型号" value={exif.lens_model} />}
              </div>
            </div>
          )}

          {/* 其他设置 */}
          {(exif.flash || exif.white_balance || exif.exposure_mode) && (
            <div className={clsx("p-3 rounded-lg", isDark ? "bg-white/5" : "bg-gray-100")}>
              <p className={clsx("font-semibold mb-2", themeStyles.textSecondary)}>🎨 其他设置</p>
              <div className="space-y-2 pl-3">
                {exif.flash && <InfoRow label="闪光灯" value={exif.flash} />}
                {exif.white_balance && <InfoRow label="白平衡" value={exif.white_balance} />}
                {exif.exposure_mode && <InfoRow label="曝光模式" value={exif.exposure_mode} />}
                {exif.exposure_program && <InfoRow label="曝光程序" value={exif.exposure_program} />}
                {exif.metering_mode && <InfoRow label="测光模式" value={exif.metering_mode} />}
                {exif.scene_capture_type && <InfoRow label="场景类型" value={exif.scene_capture_type} />}
              </div>
            </div>
          )}

          {/* 拍摄时间 */}
          {exif.date_time_original && (
            <div className={clsx("p-3 rounded-lg", isDark ? "bg-white/5" : "bg-gray-100")}>
              <p className={clsx("font-semibold mb-2", themeStyles.textSecondary)}>🕐 拍摄时间</p>
              <div className="pl-3">
                <InfoRow label="拍摄时间" value={formatDate(exif.date_time_original)} />
              </div>
            </div>
          )}

          {/* GPS 信息 */}
          {exif.has_gps && (
            <div className={clsx("p-3 rounded-lg", isDark ? "bg-white/5" : "bg-gray-100")}>
              <p className={clsx("font-semibold mb-2", themeStyles.textSecondary)}>📍 GPS 位置</p>
              <div className="space-y-2 pl-3">
                {exif.gps_latitude && <InfoRow label="纬度" value={exif.gps_latitude.toFixed(6)} />}
                {exif.gps_longitude && <InfoRow label="经度" value={exif.gps_longitude.toFixed(6)} />}
                {exif.gps_altitude && <InfoRow label="海拔" value={`${exif.gps_altitude.toFixed(2)}m`} />}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// 使用 memo 优化性能，避免不必要的重渲染
export default memo(PhotoExifPanel);

