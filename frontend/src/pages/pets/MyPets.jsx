// src/pages/pets/MyPets.jsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import PetCard from '../../components/pet/PetCard'
import EmptyState from '../../components/common/EmptyState'
import { LoadingPage } from '../../components/common/LoadingSpinner'

const MyPets = () => {
  const { pets, fetchPets, loading } = usePets()

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  if (loading) {
    return <LoadingPage message="Loading your pets..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            My Pets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your pet profiles and health records
          </p>
        </div>
        <Link to="/pets/add">
          <Button icon={FiPlus}>Add New Pet</Button>
        </Link>
      </div>

      {/* Search & Filter */}
      {pets.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search pets..."
              className="input-field pl-10"
            />
          </div>
          <Button variant="secondary" icon={FiFilter}>
            Filter
          </Button>
        </div>
      )}

      {/* Pets Grid */}
      {pets.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {pets.map((pet, index) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PetCard pet={pet} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card>
          <EmptyState
            icon={FiPlus}
            title="No pets yet"
            description="Add your first pet to start tracking their health and create their digital profile."
            action={() => (window.location.href = '/pets/add')}
            actionLabel="Add Your First Pet"
          />
        </Card>
      )}
    </div>
  )
}

export default MyPets