// src/pages/pets/AddPet.jsx
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft } from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import PetForm from '../../components/pet/PetForm'

const AddPet = () => {
  const navigate = useNavigate()
  const { addPet, loading } = usePets()

  const handleSubmit = async (data) => {
    try {
      await addPet(data)
      navigate('/pets')
    } catch (error) {
      // Error handled in context
    }
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
              <Card.Title>Add New Pet</Card.Title>
              <Card.Description>
                Create a profile for your pet to start tracking their health
              </Card.Description>
            </div>
          </Card.Header>

          <PetForm onSubmit={handleSubmit} loading={loading} />
        </Card>
      </motion.div>
    </div>
  )
}

export default AddPet