import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, USER_ROLES } from '../lib/supabase'
import { useNotification } from './NotificationContext'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showSuccess, showError, showInfo } = useNotification()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Check if user exists but profile doesn't, and create one
  useEffect(() => {
    if (user && !profile && !loading) {
      console.log('User exists but no profile, creating default profile...')
      createDefaultProfile(user.id)
    }
  }, [user, profile, loading])

  const fetchUserProfile = async (userId) => {
    try {
      console.log('Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile...')
          await createDefaultProfile(userId)
        }
        return
      }

      console.log('Profile fetched successfully:', data)
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const createDefaultProfile = async (userId) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: user.email,
            role: 'customer', // Default role
            full_name: user.user_metadata?.full_name || '',
            phone: '',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        return
      }

      console.log('Default profile created:', data)
      setProfile(data)
    } catch (error) {
      console.error('Error creating default profile:', error)
    }
  }

  const signUp = async (email, password, userRole, userData = {}) => {
    try {
      setLoading(true)
      
      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userRole,
            ...userData
          }
        }
      })

      if (error) throw error

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              role: userRole,
              full_name: userData.fullName || '',
              phone: userData.phone || '',
              created_at: new Date().toISOString()
            }
          ])

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      showSuccess('Account created successfully! Please check your email to verify your account.')
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      showError(error.message || 'Failed to create account. Please try again.')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      showSuccess(`Welcome back! You're now signed in.`)
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      showError(error.message || 'Failed to sign in. Please check your credentials.')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      showInfo('You have been signed out successfully. See you next time!')
      
      // Redirect to home page after successful sign out
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      showError('Failed to sign out. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile
      await fetchUserProfile(user.id)
      
      return { data, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isCustomer: profile?.role === USER_ROLES.CUSTOMER,
    isHoster: profile?.role === USER_ROLES.HOSTER
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
