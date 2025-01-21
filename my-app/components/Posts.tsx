"use client";

import { useEffect, useState } from "react";
import { fetchPosts, toggleLike, deletePost, updatePost} from "@/utils/api";
import { Heart, UserCircle, MoreVertical, Edit, Trash } from "lucide-react";

interface Post {
  content: string;
  image: string | null;
  like_count: number;
  comments: number;
  formatted_date: string;
  username: string;
  id: number;
  like_by_me: boolean;
}

interface PostsProps {
  username: string;
}

export function Posts({ username }: PostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await fetchPosts(username);
        setPosts(data.posts);
      } catch (err) {
        setError("Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, [username]);

  const handleToggleLike = async (id: number) => {
    try {
      const newLikeStatus = await toggleLike(id);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id
            ? {
                ...post,
                like_count: newLikeStatus.success
                  ? post.like_count + 1
                  : post.like_count - 1,
                like_by_me: newLikeStatus.success,
              }
            : post
        )
      );
    } catch (err) {
      console.error("Failed to toggle like status", err);
    }
  };

  const handleDeletePost = async () => {
    if (selectedPost) {
      try {
        await deletePost(selectedPost.id);
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== selectedPost.id));
        setIsDeleteModalOpen(false);
      } catch (err) {
        console.error("Failed to delete post", err);
      }
    }
  };

  const handleUpdatePost = async () => {
    if (selectedPost) {
      try {
        await updatePost(selectedPost.id, { content: editContent });
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === selectedPost.id ? { ...post, content: editContent } : post
          )
        );
        setIsEditModalOpen(false);
      } catch (err) {
        console.error("Failed to update post", err);
      }
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (posts.length === 0) {
    return <div className="text-center">No posts available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <article key={post.id} className="rounded-lg border bg-white dark:bg-gray-800 overflow-hidden flex flex-col">
          <div className="p-3 flex-grow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {post?.user_image ? (
                  <img
                    src={`http://127.0.0.1:8000/api${post.user_image}`}
                    alt={post.username}
                    className="h-11 w-11 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <UserCircle className="text-gray-300 h-11 w-11" />
                )}
                <span className="text-gray-600 dark:text-gray-400">@{post?.username}</span>
              </div>
              <div className="relative">
                <button
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                  onClick={() => setSelectedPost(post)}
                >
                  <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
                {selectedPost?.id === post.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                    <button
                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      onClick={() => {
                        setEditContent(post.content);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      <Trash className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="min-h-[100px] flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md mb-4">
              <p className="text-gray-900 dark:text-gray-100 text-center">{post.content}</p>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
            <button
              className="flex items-center space-x-1 hover:text-red-500"
              onClick={() => handleToggleLike(post.id)}
            >
              <Heart
                className={`h-5 w-5 ${
                  post.like_by_me ? "fill-current text-red-500" : "text-gray-500"
                }`}
              />
              <span>{post.like_count}</span>
            </button>
            <time className="text-sm text-gray-500 dark:text-gray-400">
              <span>{post.formatted_date}</span>
            </time>
          </div>
        </article>
      ))}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Delete Post</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">Are you sure you want to delete this post?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                onClick={() => {setIsDeleteModalOpen(false); setSelectedPost(null)}}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={()=> {handleDeletePost(); setSelectedPost(null);}}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Edit Post</h2>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 dark:bg-gray-700 dark:text-gray-100"
            />
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                onClick={() =>{ setIsEditModalOpen(false); setSelectedPost(null)}}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={()=> {handleUpdatePost(); setSelectedPost(null)}}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}