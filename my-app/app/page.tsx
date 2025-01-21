"use client";

import { useEffect, useState } from "react";
import { allPost, toggleLike } from "@/utils/api";
import { Heart, UserCircle } from "lucide-react";

interface Post {
  content: string;
  image: string | null;
  like_count: number;
  comments: number;
  formatted_date: string;
  username: string;
  id: number;
  like_by_me: boolean; // Track if the post is liked by the user
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load

  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await allPost(nextPage);
        setPosts(data.results);
        setHasMore(data.next !== null); // Check if there is a next page
      } catch (err) {
        setError("Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleLoadMore = async () => {
    if (!hasMore) return; // Don't fetch more posts if there are no more pages
    setIsLoading(true);
    const nextPageNumber = nextPage + 1;
    setNextPage(nextPageNumber);

    try {
      const data = await allPost(nextPageNumber);
      setPosts((prevPosts) => [...prevPosts, ...data.results]);
      setHasMore(data.next !== null); // Check if there is a next page
    } catch (err) {
      setError("Failed to load more posts");
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading && nextPage === 1) {
    return <div className="text-center">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (posts.length === 0) {
    return <div className="text-center">No posts available</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-lg border bg-white dark:bg-gray-800 overflow-hidden flex flex-col"
          >
            <div className="p-4 flex-grow">
              <div className="flex items-center space-x-2 mb-2">
                {post?.user_image ? (
                  <img
                    src={`http://127.0.0.1:8000/api${post.user_image}`}
                    alt={post.username}
                    className="h-11 w-11 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <UserCircle className="text-gray-300 h-11 w-11" />
                )}
                <span className="text-gray-600 dark:text-gray-400">
                  @{post?.username}
                </span>
              </div>
              <div className="min-h-[100px] flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md mb-4">
                <p className="text-gray-900 dark:text-gray-100 text-center">
                  {post.content}
                </p>
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
      </div>
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;