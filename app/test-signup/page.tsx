"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"

export default function TestSignupPage() {
  const { signUp } = useAuth()
  const [testResult, setTestResult] = useState<string>("")
  const [isTesting, setIsTesting] = useState(false)

  const runSignupTest = async () => {
    setIsTesting(true)
    setTestResult("Starting signup test...\n")
    
    try {
      // Test user data
      const testData = {
        email: `test-${Date.now()}@example.com`,
        password: "TestPassword123!",
        name: "Test User",
        username: `testuser${Date.now()}`,
        starSign: "Aries",
        age: 25
      }
      
      setTestResult(prev => prev + `Testing with data: ${JSON.stringify(testData, null, 2)}\n`)
      
      // Run signup
      await signUp(
        testData.email,
        testData.password,
        testData.name,
        testData.username,
        testData.starSign,
        testData.age
      )
      
      setTestResult(prev => prev + "✅ Signup completed successfully!\n")
      
      // Check localStorage
      const storedUsers = localStorage.getItem('fomo-users')
      const users = storedUsers ? JSON.parse(storedUsers) : {}
      
      setTestResult(prev => prev + `📦 Stored users in localStorage: ${JSON.stringify(users, null, 2)}\n`)
      
      // Check if user data is properly stored
      const testUserId = Object.keys(users).find(id => users[id].email === testData.email)
      if (testUserId) {
        const userData = users[testUserId]
        setTestResult(prev => prev + `✅ User data stored correctly:\n- Name: ${userData.name}\n- Username: ${userData.username}\n- Email: ${userData.email}\n`)
      } else {
        setTestResult(prev => prev + "❌ User data not found in localStorage\n")
      }
      
    } catch (error) {
      setTestResult(prev => prev + `❌ Signup failed: ${error}\n`)
    } finally {
      setIsTesting(false)
    }
  }

  const checkCurrentUser = () => {
    const storedUsers = localStorage.getItem('fomo-users')
    const users = storedUsers ? JSON.parse(storedUsers) : {}
    setTestResult(`Current users in localStorage: ${JSON.stringify(users, null, 2)}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Signup Process Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                onClick={runSignupTest} 
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? "Running Test..." : "Run Signup Test"}
              </Button>
              
              <Button 
                onClick={checkCurrentUser} 
                variant="outline"
                className="w-full"
              >
                Check Current Users
              </Button>
            </div>
            
            {testResult && (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 