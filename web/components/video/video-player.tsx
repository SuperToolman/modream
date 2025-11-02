'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from "@heroui/button";
import { Slider } from "@heroui/slider";
import { Chip } from "@heroui/chip";

interface VideoPlayerProps {
    src: string;
    poster?: string;
    title?: string;
}

export default function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [quality, setQuality] = useState('1080P');
    const [playbackRate, setPlaybackRate] = useState(1);

    const controlsTimeoutRef = useRef<NodeJS.Timeout>();

    // 格式化时间
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // 播放/暂停
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // 音量控制
    const handleVolumeChange = (value: number | number[]) => {
        const newVolume = Array.isArray(value) ? value[0] : value;
        if (videoRef.current) {
            videoRef.current.volume = newVolume / 100;
            setVolume(newVolume / 100);
            setIsMuted(newVolume === 0);
        }
    };

    // 静音切换
    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // 进度控制
    const handleProgressChange = (value: number | number[]) => {
        const newTime = Array.isArray(value) ? value[0] : value;
        if (videoRef.current) {
            videoRef.current.currentTime = (newTime / 100) * duration;
        }
    };

    // 全屏切换
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            videoRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // 倍速控制
    const handlePlaybackRateChange = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
    };

    // 控制栏显示/隐藏
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    // 键盘快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!videoRef.current) return;
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                videoRef.current.currentTime -= 10;
                break;
            case 'ArrowRight':
                e.preventDefault();
                videoRef.current.currentTime += 10;
                break;
            case 'ArrowUp':
                e.preventDefault();
                const newVolumeUp = Math.min(volume + 0.1, 1);
                handleVolumeChange(newVolumeUp * 100);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const newVolumeDown = Math.max(volume - 0.1, 0);
                handleVolumeChange(newVolumeDown * 100);
                break;
            case 'KeyF':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'KeyM':
                e.preventDefault();
                toggleMute();
                break;
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        
        // 添加键盘事件监听
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            document.removeEventListener('keydown', handleKeyDown);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [volume, isPlaying]);

    return (
        <div 
            className="relative w-full h-full bg-black group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* 视频元素 */}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                preload="metadata"
                controls={true}
                onError={(e) => {
                    console.error('Video error:', e);
                    console.log('Video src:', src);
                }}
                onLoadStart={() => console.log('Video load started')}
                onCanPlay={() => console.log('Video can play')}
            >
                <source src={src} type="video/mp4" />
                <p>您的浏览器不支持视频播放。</p>
            </video>

            {/* 播放按钮覆盖层 */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Button
                        isIconOnly
                        size="lg"
                        color="primary"
                        variant="solid"
                        className="w-16 h-16"
                        onPress={togglePlay}
                    >
                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </Button>
                </div>
            )}

            {/* 控制栏 */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
            }`}>
                {/* 进度条 */}
                <div className="mb-4">
                    <Slider
                        size="sm"
                        step={0.1}
                        maxValue={100}
                        minValue={0}
                        value={duration ? (currentTime / duration) * 100 : 0}
                        onChange={handleProgressChange}
                        className="w-full"
                        classNames={{
                            track: "bg-white/20",
                            filler: "bg-primary",
                            thumb: "bg-primary"
                        }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    {/* 左侧控制 */}
                    <div className="flex items-center gap-3">
                        {/* 播放/暂停 */}
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-white"
                            onPress={togglePlay}
                        >
                            {isPlaying ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            )}
                        </Button>

                        {/* 时间显示 */}
                        <span className="text-white text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        {/* 音量控制 */}
                        <div className="flex items-center gap-2">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="text-white"
                                onPress={toggleMute}
                            >
                                {isMuted || volume === 0 ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                    </svg>
                                )}
                            </Button>
                            <div className="w-20">
                                <Slider
                                    size="sm"
                                    step={1}
                                    maxValue={100}
                                    minValue={0}
                                    value={isMuted ? 0 : volume * 100}
                                    onChange={handleVolumeChange}
                                    classNames={{
                                        track: "bg-white/20",
                                        filler: "bg-white",
                                        thumb: "bg-white"
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 右侧控制 */}
                    <div className="flex items-center gap-2">
                        {/* 倍速控制 */}
                        <div className="flex gap-1">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                <Button
                                    key={rate}
                                    size="sm"
                                    variant={playbackRate === rate ? "solid" : "light"}
                                    color={playbackRate === rate ? "primary" : "default"}
                                    className={`text-xs ${playbackRate === rate ? '' : 'text-white'}`}
                                    onPress={() => handlePlaybackRateChange(rate)}
                                >
                                    {rate}x
                                </Button>
                            ))}
                        </div>

                        {/* 画质选择 */}
                        <Chip size="sm" variant="flat" className="text-white bg-white/20">
                            {quality}
                        </Chip>

                        {/* 全屏按钮 */}
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-white"
                            onPress={toggleFullscreen}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>

            {/* 快捷键提示 */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/80 text-white text-xs p-2 rounded">
                    <div>空格: 播放/暂停</div>
                    <div>← →: 快退/快进10秒</div>
                    <div>↑ ↓: 音量调节</div>
                    <div>F: 全屏</div>
                    <div>M: 静音</div>
                </div>
            </div>
        </div>
    );
}
