import { motion } from 'framer-motion'

export default function QuickAction({ label, href, onClick, icon: Icon, color, disabled, children }) {
  const baseClass = 'btn flex items-center gap-2'

  if (href) {
    return (
      <motion.a
        href={href}
        className={`${baseClass} bg-gradient-to-r ${color} text-white hover:shadow-glow hover:shadow-lg`}
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className="w-4 h-4" />
        {label}
      </motion.a>
    )
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} bg-gradient-to-r ${color} text-white hover:shadow-glow hover:shadow-lg ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="w-4 h-4" />
      {label}
    </motion.button>
  )
}