// src/pages/pets/EditPet.jsx
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft } from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import PetForm from '../../components/pet/PetForm'
import { LoadingPage } from '../../components/common/LoadingSpinner'

const EditPet = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedPet: pet, getPetById, updatePet, loading } = usePets()

  useEffect(() => {
    getPetById(id)
  }, [id, getPetById])

  const handleSubmit = async (data) => {
    try {
      await updatePet(id, data)
      navigate(`/pets/${id}`)
    } catch (error) {
      // Error handled in context
    }
  }

  if (loading || !pet) {
    return <LoadingPage message="Loading pet details..." />
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          icon={FiArrowLeft}
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Back
        </Button>

        <Card>
          <Card.Header>
            <div>
              <Card.Title>Edit {pet.name}</Card.Title>
              <Card.Description>
                Update your pet's profile information
              </Card.Description>
            </div>
          </Card.Header>

          <PetForm initialData={pet} onSubmit={handleSubmit} loading={loading} />
        </Card>
      </motion.div>
    </div>
  )
}

export default EditPet