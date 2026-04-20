// src/components/pet/PetList.jsx
import { motion } from 'framer-motion'
import PetCard from './PetCard'
import EmptyState from '../common/EmptyState'
import { FiPlus } from 'react-icons/fi'

const PetList = ({ pets, loading, onAddPet, compact = false }) => {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-72 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!pets || pets.length === 0) {
    return (
      <EmptyState
        icon={FiPlus}
        title="No pets yet"
        description="Add your first pet to start tracking their health"
        action={onAddPet}
        actionLabel="Add Your First Pet"
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`grid ${compact ? 'gap-4' : 'sm:grid-cols-2 lg:grid-cols-3 gap-6'}`}
    >
      {pets.map((pet, index) => (
        <motion.div
          key={pet.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PetCard pet={pet} compact={compact} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default PetList