'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' // Import useRouter
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { searchUser } from '@/utils/api'
import { Loader2 } from 'lucide-react'

export default function SearchFriends() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter() // Initialize useRouter

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const results = await searchUser(searchTerm)
      setSearchResults(results.data)
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserClick = (username: string) => {
    // Redirect to the friend's profile page
    router.push(`/${username}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="rounded-lg p-6 shadow-sm bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Search Friends</h1>
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name or username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {searchResults.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No users found.</p>
          ) : (
            searchResults.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer dark:border-gray-600"
                onClick={() => handleUserClick(user.username)} // Add onClick handler
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-gray-100 dark:bg-gray-600">
                    {user.profile_image ? (
                      <AvatarImage
                        src={`http://127.0.0.1:8000/api${user.profile_image}`}
                        alt={user.username}
                      />
                    ) : null}
                    <AvatarFallback className="text-gray-400 dark:text-gray-300">
                      {user.first_name.charAt(0)}
                      {user.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-gray-500 text-sm dark:text-gray-400">@{user.username}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}