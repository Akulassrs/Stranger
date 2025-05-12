import { useState, useEffect, useRef } from 'react'
import { Button } from "/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "/components/ui/card"
import { Users, Video, MessageSquare, Clock, Bot } from 'lucide-react'

// Mock user data for simulation
const mockUsers = [
  { id: 'user1', name: 'Alex', available: true },
  { id: 'user2', name: 'Taylor', available: true },
  { id: 'user3', name: 'Jordan', available: true },
  { id: 'user4', name: 'Casey', available: true },
]

// AI bot responses
const aiResponses = [
  "That's an interesting perspective!",
  "I'm an AI here to chat while you wait for a human connection.",
  "What are your thoughts on this topic?",
  "I'm learning from these conversations to become more helpful.",
  "That's a great point! Humans often say similar things.",
  "I can chat about many topics - what interests you?",
  "This is fascinating. Tell me more.",
  "I don't have personal experiences but I can share information.",
  "How has your day been so far?",
  "What do you enjoy doing in your free time?"
]

export default function RandomChatApp() {
  // App states
  const [status, setStatus] = useState<'idle' | 'searching' | 'connected'>('idle')
  const [matchedUser, setMatchedUser] = useState<{id: string, name: string, isAI?: boolean} | null>(null)
  const [messages, setMessages] = useState<{text: string, sender: 'me' | 'them', time: string}[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [videoCallStatus, setVideoCallStatus] = useState<'none' | 'requested' | 'active'>('none')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [callRequestedBy, setCallRequestedBy] = useState<'me' | 'them' | null>(null)
  const [availableUsers, setAvailableUsers] = useState(mockUsers)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Simulate finding a random user or AI
  const findRandomUser = () => {
    setStatus('searching')
    setMessages([])
    setVideoCallStatus('none')
    setTimeLeft(300)
    
    // Check if any human users are available
    const availableHumans = availableUsers.filter(user => user.available)
    
    // Simulate search delay
    setTimeout(() => {
      if (availableHumans.length > 0) {
        // Connect with random human
        const randomIndex = Math.floor(Math.random() * availableHumans.length)
        const randomUser = availableHumans[randomIndex]
        
        // Mark user as unavailable
        setAvailableUsers(prev => 
          prev.map(user => 
            user.id === randomUser.id ? {...user, available: false} : user
          )
        )
        
        setMatchedUser(randomUser)
        setStatus('connected')
        
        // Simulate greeting from matched user
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: `Hi there! I'm ${randomUser.name}. Nice to meet you!`,
            sender: 'them',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }])
        }, 1000)
      } else {
        // Connect with AI bot
        setMatchedUser({ id: 'ai1', name: 'AI Companion', isAI: true })
        setStatus('connected')
        
        // AI greeting
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: "Hello! I'm an AI companion here to chat while you wait for a human connection.",
            sender: 'them',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }])
        }, 1000)
      }
    }, 2000)
  }

  // Handle sending a message
  const sendMessage = () => {
    if (!messageInput.trim()) return
    
    const newMessage = {
      text: messageInput,
      sender: 'me' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages(prev => [...prev, newMessage])
    setMessageInput('')
    
    // Simulate response after a delay
    setTimeout(() => {
      if (matchedUser?.isAI) {
        // AI response
        setMessages(prev => [...prev, {
          text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
          sender: 'them' as const,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }])
      } else if (Math.random() > 0.3) { // 70% chance of human response
        setMessages(prev => [...prev, {
          text: getRandomHumanResponse(),
          sender: 'them' as const,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }])
      }
    }, 1000 + Math.random() * 3000)
  }

  // Handle video call request
  const requestVideoCall = () => {
    if (matchedUser?.isAI) {
      setMessages(prev => [...prev, {
        text: "I'm an AI and can't participate in video calls. You can only chat with me.",
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
      return
    }
    
    setVideoCallStatus('requested')
    setCallRequestedBy('me')
    
    // Simulate user response after delay
    setTimeout(() => {
      if (Math.random() > 0.5) { // 50% chance of acceptance
        setVideoCallStatus('active')
      } else {
        setVideoCallStatus('none')
        setMessages(prev => [...prev, {
          text: `${matchedUser?.name} declined the video call request.`,
          sender: 'them',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }])
      }
    }, 2000)
  }

  // Handle ending the call/session
  const endSession = () => {
    // Mark human user as available again if not AI
    if (matchedUser && !matchedUser.isAI) {
      setAvailableUsers(prev => 
        prev.map(user => 
          user.id === matchedUser.id ? {...user, available: true} : user
        )
      )
    }
    
    setStatus('idle')
    setMatchedUser(null)
    setVideoCallStatus('none')
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // Countdown timer effect
  useEffect(() => {
    if (status !== 'connected') return
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout)
          setTimeout(() => {
            endSession()
          }, 1000)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status])

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Random responses for human users
  const getRandomHumanResponse = () => {
    const responses = [
      "That's interesting!",
      "I see what you mean.",
      "Tell me more about that.",
      "I hadn't thought about it that way.",
      "What do you think about this topic?",
      "That's a good point!",
      "I agree with you.",
      "Let's change the subject.",
      "How's your day going?",
      "Do you have any hobbies?"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Simulate incoming video call request (only from humans)
  const simulateIncomingCall = () => {
    if (matchedUser?.isAI) return
    if (videoCallStatus !== 'none' || Math.random() < 0.7) return // 30% chance of incoming call
    
    setVideoCallStatus('requested')
    setCallRequestedBy('them')
    setMessages(prev => [...prev, {
      text: `${matchedUser?.name} is requesting a video call.`,
      sender: 'them',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
  }

  // Handle call acceptance
  const acceptCall = () => {
    if (videoCallStatus === 'requested' && callRequestedBy === 'them') {
      setVideoCallStatus('active')
      setMessages(prev => [...prev, {
        text: "You accepted the video call request.",
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    }
  }

  // Handle call rejection
  const rejectCall = () => {
    setVideoCallStatus('none')
    setMessages(prev => [...prev, {
      text: "You declined the video call request.",
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
  }

  // Simulate occasional incoming call requests (only from humans)
  useEffect(() => {
    if (status !== 'connected' || videoCallStatus !== 'none' || matchedUser?.isAI) return
    
    const interval = setInterval(() => {
      simulateIncomingCall()
    }, 15000) // Check every 15 seconds
    
    return () => clearInterval(interval)
  }, [status, videoCallStatus, matchedUser])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {matchedUser?.isAI ? (
                <Bot className="mr-2 h-6 w-6" />
              ) : (
                <Users className="mr-2 h-6 w-6" />
              )}
              <span>
                {matchedUser?.isAI ? 'AI Companion' : 'Random Connection'}
              </span>
            </div>
            {status === 'connected' && (
              <div className="flex items-center text-sm font-normal">
                <Clock className="mr-1 h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Connection status */}
          {status === 'idle' && (
            <div className="text-center py-8">
              <p className="mb-4">Click below to find a random person to chat with for 5 minutes</p>
              <Button onClick={findRandomUser}>
                <Users className="mr-2 h-4 w-4" />
                Find Someone
              </Button>
            </div>
          )}
          
          {status === 'searching' && (
            <div className="text-center py-8">
              <div className="animate-pulse flex flex-col items-center">
                <Users className="h-8 w-8 mb-2" />
                <p>Searching for someone to connect with...</p>
              </div>
            </div>
          )}
          
          {status === 'connected' && matchedUser && (
            <div className="space-y-4">
              {/* Video call section (only for human connections) */}
              {!matchedUser.isAI && (
                <>
                  {videoCallStatus === 'active' ? (
                    <div className="relative bg-black rounded-lg aspect-video">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <Button 
                          variant="destructive" 
                          onClick={() => setVideoCallStatus('none')}
                          className="flex items-center"
                        >
                          <Video className="mr-2 h-4 w-4" />
                          End Call
                        </Button>
                      </div>
                    </div>
                  ) : videoCallStatus === 'requested' ? (
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="mb-2">
                        {callRequestedBy === 'me' 
                          ? `Waiting for ${matchedUser.name} to accept your call...` 
                          : `${matchedUser.name} is requesting a video call`}
                      </p>
                      <div className="flex justify-center space-x-4">
                        {callRequestedBy === 'them' && (
                          <>
                            <Button variant="default" onClick={acceptCall}>
                              Accept
                            </Button>
                            <Button variant="outline" onClick={rejectCall}>
                              Decline
                            </Button>
                          </>
                        )}
                        {callRequestedBy === 'me' && (
                          <Button variant="outline" onClick={() => setVideoCallStatus('none')}>
                            Cancel Request
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        onClick={requestVideoCall}
                        className="flex items-center"
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Start Video Call
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              {/* Chat section */}
              <div className="border rounded-lg p-4 h-64 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    {matchedUser.isAI 
                      ? "Start chatting with your AI companion!" 
                      : `Start chatting with ${matchedUser.name}!`}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${msg.sender === 'me' 
                            ? 'bg-primary text-primary-foreground' 
                            : matchedUser.isAI 
                              ? 'bg-purple-100 text-purple-900' 
                              : 'bg-muted'}`}
                        >
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.sender === 'me' 
                            ? 'text-primary-foreground/70' 
                            : matchedUser.isAI 
                              ? 'text-purple-900/70' 
                              : 'text-muted-foreground'}`}
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={sendMessage}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        
        {status === 'connected' && (
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={endSession}>
              End Session
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}