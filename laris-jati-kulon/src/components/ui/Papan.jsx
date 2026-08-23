/**
 * Permukaan dasar (kartu/panel). Bagian atas rata seperti papan lapak,
 * bawah sedikit tumpul — sengaja tidak seragam rounded di semua sisi.
 */
export default function Papan({ as: Tag = 'div', className = '', children, ...sisa }) {
  return (
    <Tag
      className={[
        'tex-kertas sudut-lapak border border-wood-mid/55 shadow-lapak',
        className,
      ].join(' ')}
      {...sisa}
    >
      {children}
    </Tag>
  )
}
