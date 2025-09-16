import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import AdminPanel from '@/components/AdminPanel'
import { Navigate } from 'react-router-dom'

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [user])

  const checkAdminStatus = async () => {
    if (!user) {
      setCheckingAdmin(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users_app')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setIsAdmin(data.is_admin)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    } finally {
      setCheckingAdmin(false)
    }
  }

  if (isLoading || checkingAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPanel isAdmin={isAdmin} />
    </div>
  )
}