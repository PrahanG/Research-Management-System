"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function Profile() {
  const [user, setUser] = useState({
    username: "",
    role: "",
    bio: "",
    avatar: "/download.jpg",
  })
  const [editing, setEditing] = useState(false)
  const [bioDraft, setBioDraft] = useState("")
  const [imageDraft, setImageDraft] = useState("")

  // ✅ Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error("Failed to fetch user data")

        const data = await response.json()
        setUser(data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchUser()
  }, [])

  const handleEdit = () => {
    setEditing(true)
    setBioDraft(user.bio)
    setImageDraft(user.avatar)
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token")
      const updatedUser = { ...user, bio: bioDraft, avatar: imageDraft }

      const response = await fetch("http://localhost:5000/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      })

      if (!response.ok) throw new Error("Failed to update user data")

      const data = await response.json()
      setUser(data)
      setEditing(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-10 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="col-span-1 @xl/main:col-span-2 @5xl/main:col-span-4">
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="rounded-full bg-[#181818] w-[100px] h-[100px] overflow-hidden relative">
              <img
                src={editing ? imageDraft : user.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.username}</h2>
              <p className="text-muted-foreground">{user.role}</p>
            </div>
          </div>

          <div className="mt-6">
            <CardTitle className="text-2xl font-semibold">Bio</CardTitle>
            {editing ? (
              <Input
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
              />
            ) : (
              <CardDescription>{user.bio}</CardDescription>
            )}
          </div>

          {editing && (
            <div className="mt-4">
              <Input
                placeholder="Image URL"
                value={imageDraft}
                onChange={(e) => setImageDraft(e.target.value)}
              />
            </div>
          )}

          <div className="mt-4">
            {editing ? (
              <Button onClick={handleSave}>Save</Button>
            ) : (
              <Button onClick={handleEdit}>Edit</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
