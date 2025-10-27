'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

interface Comment {
    id: string;
    user: {
        name: string;
        avatar: string;
        level: number;
        isVip: boolean;
    };
    content: string;
    likes: number;
    isLiked: boolean;
    publishTime: string;
    replies?: Comment[];
    isReplying?: boolean;
}

interface VideoCommentsProps {
    videoId: string;
}

export default function VideoComments({ videoId }: VideoCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([
        {
            id: "1",
            user: {
                name: "技术爱好者",
                avatar: "https://heroui.com/images/hero-card-3.jpeg",
                level: 5,
                isVip: true
            },
            content: "这个教程太棒了！终于学会了如何用 Tauri 开发桌面应用，感谢UP主的详细讲解！",
            likes: 128,
            isLiked: false,
            publishTime: "2024-01-15 15:30:00",
            replies: [
                {
                    id: "1-1",
                    user: {
                        name: "前端新手",
                        avatar: "https://heroui.com/images/hero-card-4.jpeg",
                        level: 2,
                        isVip: false
                    },
                    content: "同感！我也是跟着这个教程学会的，现在已经能独立开发简单的桌面应用了",
                    likes: 45,
                    isLiked: false,
                    publishTime: "2024-01-15 16:00:00"
                }
            ]
        },
        {
            id: "2",
            user: {
                name: "代码小白",
                avatar: "https://heroui.com/images/hero-card-5.jpeg",
                level: 3,
                isVip: false
            },
            content: "请问UP主，Tauri 相比 Electron 有什么优势吗？性能会更好吗？",
            likes: 89,
            isLiked: true,
            publishTime: "2024-01-15 14:45:00",
            replies: []
        },
        {
            id: "3",
            user: {
                name: "全栈开发者",
                avatar: "https://heroui.com/images/hero-card-6.jpeg",
                level: 7,
                isVip: true
            },
            content: "Tauri 确实比 Electron 轻量很多，打包出来的应用体积小，内存占用也少。而且 Rust 的安全性也是一大优势。",
            likes: 234,
            isLiked: false,
            publishTime: "2024-01-15 17:20:00",
            replies: []
        }
    ]);

    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const formatTime = (timeStr: string) => {
        const date = new Date(timeStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes}分钟前`;
        } else if (hours < 24) {
            return `${hours}小时前`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days}天前`;
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toString();
    };

    const handleLike = (commentId: string, isReply: boolean = false, parentId?: string) => {
        setComments(prev => prev.map(comment => {
            if (isReply && comment.id === parentId) {
                return {
                    ...comment,
                    replies: comment.replies?.map(reply => 
                        reply.id === commentId 
                            ? { ...reply, isLiked: !reply.isLiked, likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1 }
                            : reply
                    )
                };
            } else if (comment.id === commentId) {
                return {
                    ...comment,
                    isLiked: !comment.isLiked,
                    likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
                };
            }
            return comment;
        }));
    };

    const handleSubmitComment = () => {
        if (newComment.trim()) {
            const comment: Comment = {
                id: Date.now().toString(),
                user: {
                    name: "当前用户",
                    avatar: "https://heroui.com/images/hero-card-2.jpeg",
                    level: 4,
                    isVip: false
                },
                content: newComment,
                likes: 0,
                isLiked: false,
                publishTime: new Date().toISOString(),
                replies: []
            };
            setComments(prev => [comment, ...prev]);
            setNewComment('');
        }
    };

    const handleSubmitReply = (parentId: string) => {
        if (replyContent.trim()) {
            const reply: Comment = {
                id: `${parentId}-${Date.now()}`,
                user: {
                    name: "当前用户",
                    avatar: "https://heroui.com/images/hero-card-2.jpeg",
                    level: 4,
                    isVip: false
                },
                content: replyContent,
                likes: 0,
                isLiked: false,
                publishTime: new Date().toISOString()
            };

            setComments(prev => prev.map(comment => 
                comment.id === parentId 
                    ? { ...comment, replies: [...(comment.replies || []), reply] }
                    : comment
            ));
            setReplyContent('');
            setReplyingTo(null);
        }
    };

    const CommentItem = ({ comment, isReply = false, parentId }: { comment: Comment; isReply?: boolean; parentId?: string }) => (
        <div className={`${isReply ? 'ml-12 mt-3' : ''}`}>
            <div className="flex gap-3">
                <Avatar
                    src={comment.user.avatar}
                    size={isReply ? "sm" : "md"}
                    className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {comment.user.name}
                        </span>
                        <Chip size="sm" color="primary" variant="flat">
                            Lv.{comment.user.level}
                        </Chip>
                        {comment.user.isVip && (
                            <Chip size="sm" color="warning" variant="flat">
                                VIP
                            </Chip>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(comment.publishTime)}
                        </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
                        {comment.content}
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <Button
                            size="sm"
                            variant="light"
                            startContent={
                                <svg className={`w-4 h-4 ${comment.isLiked ? 'fill-red-500 text-red-500' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            }
                            className={`text-xs ${comment.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                            onPress={() => handleLike(comment.id, isReply, parentId)}
                        >
                            {formatNumber(comment.likes)}
                        </Button>
                        
                        {!isReply && (
                            <Button
                                size="sm"
                                variant="light"
                                className="text-xs text-gray-500"
                                onPress={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            >
                                回复
                            </Button>
                        )}
                    </div>
                    
                    {/* 回复输入框 */}
                    {replyingTo === comment.id && (
                        <div className="mt-3 space-y-2">
                            <Input
                                placeholder={`回复 @${comment.user.name}`}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                type="text"
                                variant="bordered"
                                size="sm"
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    color="primary"
                                    onPress={() => handleSubmitReply(comment.id)}
                                    isDisabled={!replyContent.trim()}
                                >
                                    发布
                                </Button>
                                <Button
                                    size="sm"
                                    variant="light"
                                    onPress={() => {
                                        setReplyingTo(null);
                                        setReplyContent('');
                                    }}
                                >
                                    取消
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {/* 回复列表 */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-3">
                            {comment.replies.map(reply => (
                                <CommentItem 
                                    key={reply.id} 
                                    comment={reply} 
                                    isReply={true} 
                                    parentId={comment.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    评论 ({comments.length})
                </h3>
            </CardHeader>
            <CardBody className="space-y-6">
                {/* 发表评论 */}
                <div className="space-y-3">
                    <Input
                        placeholder="发一条友善的评论"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        type="text"
                        variant="bordered"
                        size="lg"
                    />
                    <div className="flex justify-end">
                        <Button
                            color="primary"
                            onPress={handleSubmitComment}
                            isDisabled={!newComment.trim()}
                        >
                            发布评论
                        </Button>
                    </div>
                </div>

                <Divider />

                {/* 评论列表 */}
                <div className="space-y-6">
                    {comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>

                {/* 加载更多 */}
                <div className="text-center">
                    <Button variant="bordered" size="sm">
                        查看更多评论
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}
