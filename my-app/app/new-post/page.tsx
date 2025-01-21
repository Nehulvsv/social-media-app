'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ImagePlus } from 'lucide-react'
import { createPost } from '@/utils/api'

export default function NewPost() {
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) {
      return alert('Please enter content')
    }

    const res = await createPost(content);
    // alert('Post created successfully!')
    router.push(`/${res.post.username}`) // Redirect to profile page after posting
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">What's on your mind?</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  required
                  className="min-h-[100px]"
                />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="image">Add an image (optional)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Choose Image
                  </Button>
                  {image && <span className="text-sm text-gray-500">{image.name}</span>}
                </div>
              </div> */}
              <Button type="submit" className="w-full">
                Post
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

