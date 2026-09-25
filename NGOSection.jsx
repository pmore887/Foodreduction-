import { Link } from 'react-router-dom'
import { HeartHandshake, Globe, ArrowRight, ShieldCheck } from 'lucide-react'

export default function NGOSection() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">NGO & Donation Partners</h1>
        <p className="page-subtitle">Organizations that accept food donations from households</p>
      </div>

      <div className="info-banner">
        <HeartHandshake className="info-banner-icon" size={22} />
        <div>
          <h3>How food donation works</h3>
          <p>Submit a donation request with your surplus food details. Your request is saved in our system and appears in your Donation History with a status of Pending. You can then contact one of the organizations below to arrange pickup or drop-off. The status updates to Accepted, then Completed or Rejected as your donation progresses.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="card-title" style={{ marginBottom: 12 }}>General Donation Guidelines</h2>
        <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li>Only donate food that is safe, unexpired, and properly stored.</li>
          <li>Include clear packaging and labeling with the food name and date.</li>
          <li>Provide accurate quantity and availability information.</li>
          <li>Ensure the food has not been partially consumed or contaminated.</li>
          <li>Respond promptly when an organization contacts you about your donation.</li>
        </ul>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 16 }}>Find Food Donation Organizations in India</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
          These India-based organizations work to redistribute surplus food to those in need. Visit their websites to learn about donation guidelines and local chapters near you.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <Globe size={22} style={{ color: 'var(--primary-600)', marginBottom: 8 }} />
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Robin Hood Army</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              A volunteer-driven organization that distributes surplus food to the less fortunate across cities in India.
            </p>
            <a href="https://robinhoodarmy.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              Visit Website <ArrowRight size={14} />
            </a>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <Globe size={22} style={{ color: 'var(--primary-600)', marginBottom: 8 }} />
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Feeding India</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              A non-profit organization working to solve hunger and food waste by redirecting surplus meals to those in need.
            </p>
            <a href="https://www.feedingindia.org" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              Visit Website <ArrowRight size={14} />
            </a>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <Globe size={22} style={{ color: 'var(--primary-600)', marginBottom: 8 }} />
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>India FoodBanking Network</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              A network of food banks across India that collects, stores, and distributes food to vulnerable communities.
            </p>
            <a href="https://www.indiafoodbanking.org" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              Visit Website <ArrowRight size={14} />
            </a>
          </div>
        </div>

        <div style={{ marginTop: 24, padding: 16, background: 'var(--neutral-50)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>Please verify the organization's current food donation guidelines, location and acceptance requirements before donating.</span>
        </div>
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Link to="/donate" className="btn btn-primary btn-lg">
          <HeartHandshake size={18} /> Donate Extra Food Now
        </Link>
      </div>
    </div>
  )
}
