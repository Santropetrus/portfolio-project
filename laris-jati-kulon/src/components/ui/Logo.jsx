/** Cap kawung — motif batik empat kelopak, dipakai sebagai tanda merek */
export default function Logo({ ukuran = 34, terang = true }) {
  const garis = terang ? '#EDE2CF' : '#3E2A1E'
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="2" fill="none" stroke={garis} strokeWidth="1.5" opacity=".55" />
      <g fill="none" stroke={garis} strokeWidth="1.5">
        <ellipse cx="10.5" cy="16" rx="4.6" ry="6.6" />
        <ellipse cx="21.5" cy="16" rx="4.6" ry="6.6" />
        <ellipse cx="16" cy="10.5" rx="6.6" ry="4.6" />
        <ellipse cx="16" cy="21.5" rx="6.6" ry="4.6" />
      </g>
      <circle cx="16" cy="16" r="2" fill="#4A5D75" stroke={garis} strokeWidth="1" />
    </svg>
  )
}
