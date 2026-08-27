import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/format'

function Messages() {
    const { user, socket } = useAuth()   // CHANGED — also grab socket from context
    const [params, setParams] = useSearchParams()
    const selectedJobId = params.get('job') || ''

    const [conversations, setConversations] = useState([])
    const [convLoading, setConvLoading] = useState(true)
    const [convError, setConvError] = useState('')

    useEffect(() => {
        async function fetchConversations() {
            try {
                const res = await api.get('/jobs/my-conversations')
                setConversations(res.data)
                setConvLoading(false)
            } catch (err) {
                setConvError(err.response?.data?.message || 'Failed to load conversations')
                setConvLoading(false)
            }
        }
        fetchConversations()
    }, [])

    const [messages, setMessages] = useState([])
    const [messagesError, setMessagesError] = useState('')
    const [messageContent, setMessageContent] = useState('')
    const [messageSending, setMessageSending] = useState(false)

    useEffect(() => {
        if (!selectedJobId) return
        let cancelled = false

        async function fetchMessages() {
            try {
                const res = await api.get(`/jobs/${selectedJobId}/messages`)
                if (!cancelled) {
                    setMessages(res.data.data)
                    setMessagesError('')
                }
            } catch (err) {
                if (!cancelled) {
                    setMessagesError(err.response?.data?.message || 'Failed to load this conversation')
                }
            }
        }

        fetchMessages()
        const intervalId = setInterval(fetchMessages, 5000)
        return () => {
            cancelled = true
            clearInterval(intervalId)
        }
    }, [selectedJobId])

    // NEW — listen for live incoming messages via socket
    useEffect(() => {
        if (!socket) return

        function handleNewMessage(message) {
            // only add it if it belongs to the conversation currently open
            if (message.jobId === selectedJobId) {
                setMessages((prev) => {
                    // avoid duplicating a message we already have (e.g. from polling)
                    const alreadyExists = prev.some((m) => m._id === message._id)
                    if (alreadyExists) return prev
                    return [...prev, message]
                })
            }
        }

        socket.on('new_message', handleNewMessage)

        return () => {
            socket.off('new_message', handleNewMessage)
        }
    }, [socket, selectedJobId])

    function selectConversation(jobId) {
        setParams({ job: jobId })
    }

    async function handleSendMessage(e) {
        e.preventDefault()
        setMessageSending(true)
        try {
            const res = await api.post(`/jobs/${selectedJobId}/messages`, { content: messageContent })
            setMessages((prev) => [...prev, res.data.data])
            setMessageContent('')
        } catch (err) {
            setMessagesError(err.response?.data?.message || 'Failed to send message')
        } finally {
            setMessageSending(false)
        }
    }

    const selectedConversation = conversations.find((c) => c.jobId === selectedJobId)

    if (convLoading) return <div className="container"><p className="loading-state">Loading conversations&hellip;</p></div>

    return (
        <div className="container">
            <p className="eyebrow">Inbox</p>
            <h1>Messages</h1>
            {convError && <p className="error-text">{convError}</p>}

            <div className="messages-layout">
                <div className="messages-list">
                    {conversations.length === 0 && <p className="empty-state">No active conversations yet.</p>}
                    {conversations.map((c) => (
                        <div
                            key={c.jobId}
                            className={`ledger-row ledger-row--interactive ${c.jobId === selectedJobId ? 'ledger-row--selected' : ''}`}
                            onClick={() => selectConversation(c.jobId)}
                        >
                            <div className="ledger-row-label">
                                <span className="ledger-row-title">{c.jobTitle}</span>
                                <span className="ledger-row-meta">{c.otherParticipant.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="messages-thread-pane card">
                    {!selectedJobId && <p className="empty-state">Select a conversation to view messages.</p>}
                    {selectedJobId && (
                        <>
                            <h3>{selectedConversation?.jobTitle || 'Conversation'}</h3>
                            {messagesError && <p className="error-text">{messagesError}</p>}
                            <div className="message-thread">
                                {messages.length === 0 && !messagesError && <p className="empty-state">No messages yet.</p>}
                                {messages.map((m) => (
                                    <div key={m._id} className={`message-bubble ${m.senderId === user._id ? 'message-bubble--mine' : ''}`}>
                                        <p>{m.content}</p>
                                        <p className="message-meta">{formatDate(m.createdAt)}</p>
                                    </div>
                                ))}
                            </div>
                            <form className="message-form" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    placeholder="Write a message&hellip;"
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    required
                                />
                                <button type="submit" disabled={messageSending}>Send</button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Messages