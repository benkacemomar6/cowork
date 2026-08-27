import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Code2,
    Palette,
    PenLine,
    Film,
    Smartphone,
    Megaphone,
    Search,
    FileText,
    Handshake,
    Layers,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const CATEGORIES = [
    'web developers',
    'graphic designers',
    'content writers',
    'video editors',
    'mobile developers',
]

const POPULAR = [
    { name: 'Web Development', category: 'Web Development', jobs: '2,400+ open jobs', icon: Code2 },
    { name: 'Graphic Design', category: 'Graphic Design', jobs: '1,800+ open jobs', icon: Palette },
    { name: 'Content Writing', category: 'Content Writing', jobs: '1,200+ open jobs', icon: PenLine },
    { name: 'Video Editing', category: 'Video Editing', jobs: '980+ open jobs', icon: Film },
    { name: 'Mobile Apps', category: 'Mobile Development', jobs: '760+ open jobs', icon: Smartphone },
    { name: 'Marketing', category: 'Marketing', jobs: '650+ open jobs', icon: Megaphone },
]

const STEPS = [
    {
        icon: FileText,
        title: 'Post a job',
        body: 'Describe what you need done, set a budget, and publish it in minutes.',
    },
    {
        icon: Handshake,
        title: 'Review proposals',
        body: 'Freelancers apply with their approach, timeline, and bid. Compare and pick.',
    },
    {
        icon: Layers,
        title: 'Work in milestones',
        body: 'Break the job into stages, approve each one, and pay as work is delivered.',
    },
]

export default function Home() {
    const [index, setIndex] = useState(0)
    const [search, setSearch] = useState('')
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % CATEGORIES.length)
        }, 2200)
        return () => clearInterval(id)
    }, [])

    function goToJobs(params = {}) {
        const qs = new URLSearchParams(params)
        navigate(qs.toString() ? `/jobs?${qs.toString()}` : '/jobs')
    }

    return (
        <div className="cw-page">
            {/* HERO */}
            <section className="cw-hero">
                <h1 className="cw-hero-title">
                    Find your next
                    <br />
                    <span className="cw-rotator" key={index}>
                        {CATEGORIES[index]}
                    </span>
                </h1>
                <p className="cw-hero-sub">
                    {user
                        ? `Welcome back, ${user.name}. Post a job, get proposals from real freelancers, and pay only when the work is done.`
                        : 'Post a job, get proposals from real freelancers, and pay only when the work is done.'}
                </p>
                {user && !user.isVerified && (
                    <p className="error-text">
                        Check your inbox for a verification link — we sent one to {user.email} when you signed up.
                    </p>
                )}

                <form
                    className="cw-search"
                    onSubmit={(e) => {
                        e.preventDefault()
                        goToJobs(search ? { search } : {})
                    }}
                >
                    <input
                        type="text"
                        placeholder="Try 'landing page redesign'"
                        aria-label="Search jobs"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="cw-search-btn">
                        <Search size={17} />
                        Search
                    </button>
                </form>

                <div className="cw-hero-tags">
                    <span>Popular:</span>
                    <button type="button" onClick={() => goToJobs({ search: 'logo design' })}>Logo design</button>
                    <button type="button" onClick={() => goToJobs({ search: 'wordpress' })}>WordPress</button>
                    <button type="button" onClick={() => goToJobs({ search: 'voice over' })}>Voice over</button>
                    <button type="button" onClick={() => goToJobs({ search: 'seo' })}>SEO</button>
                </div>
            </section>

            {/* TRUST STRIP */}
            <section className="cw-trust">
                <p>Trusted by teams shipping real work, every day</p>
                <div className="cw-trust-stats">
                    <div>
                        <strong>18,000+</strong>
                        <span>jobs posted</span>
                    </div>
                    <div>
                        <strong>6,200+</strong>
                        <span>active freelancers</span>
                    </div>
                    <div>
                        <strong>94%</strong>
                        <span>jobs completed on milestone</span>
                    </div>
                </div>
            </section>

            {/* CATEGORIES */}
            <section id="categories" className="cw-categories">
                <h2>Browse by category</h2>
                <div className="cw-category-grid">
                    {POPULAR.map((c) => {
                        const Icon = c.icon
                        return (
                            <a
                                href={`/jobs?category=${encodeURIComponent(c.category)}`}
                                className="cw-category-card"
                                key={c.name}
                                onClick={(e) => {
                                    e.preventDefault()
                                    goToJobs({ category: c.category })
                                }}
                            >
                                <span className="cw-category-icon">
                                    <Icon size={18} />
                                </span>
                                <span className="cw-category-name">{c.name}</span>
                                <span className="cw-category-count">{c.jobs}</span>
                            </a>
                        )
                    })}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="cw-how">
                <h2>How CoWork works</h2>
                <div className="cw-steps">
                    {STEPS.map((s) => {
                        const Icon = s.icon
                        return (
                            <div className="cw-step" key={s.title}>
                                <span className="cw-step-icon">
                                    <Icon size={19} />
                                </span>
                                <h3>{s.title}</h3>
                                <p>{s.body}</p>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* CTA */}
            <section className="cw-cta">
                <h2>Have work that needs doing?</h2>
                <p>Post your first job free &mdash; no fees until you hire.</p>
                <div className="cw-cta-actions">
                    {user && user.role === 'client' && (
                        <a href="/jobs/new" className="cw-btn cw-btn-green" onClick={(e) => { e.preventDefault(); navigate('/jobs/new') }}>
                            Post a job
                        </a>
                    )}
                    {user && user.role === 'freelancer' && (
                        <a href="/jobs" className="cw-btn cw-btn-green" onClick={(e) => { e.preventDefault(); navigate('/jobs') }}>
                            Browse jobs
                        </a>
                    )}
                    {!user && (
                        <>
                            <a href="/register" className="cw-btn cw-btn-green" onClick={(e) => { e.preventDefault(); navigate('/register') }}>
                                Join CoWork
                            </a>
                            <a href="/jobs" className="cw-btn cw-btn-outline" onClick={(e) => { e.preventDefault(); navigate('/jobs') }}>
                                Browse jobs
                            </a>
                        </>
                    )}
                </div>
            </section>
        </div>
    )
}
