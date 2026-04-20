// src/components/vet/VetList.jsx
import { motion } from 'framer-motion'
import VetCard from './VetCard'
import EmptyState from '../common/EmptyState'
import { FiMapPin } from 'react-icons/fi'

const VetList = ({ vets, loading, onGetDirections }) => {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-80 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!vets || vets.length === 0) {
    return (
      <EmptyState
        icon={FiMapPin}
        title="No veterinary clinics found"
        description="Try expanding your search radius or check your location settings"
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {vets.map((vet, index) => (
        <motion.div
          key={vet.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <VetCard vet={vet} onGetDirections={onGetDirections} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default VetList