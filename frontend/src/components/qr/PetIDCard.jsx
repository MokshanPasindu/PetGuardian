// src/components/qr/PetIDCard.jsx
import Badge from '../common/Badge'
import { calculateAge } from '../../utils/helpers'

const PetIDCard = ({ pet }) => {
  if (!pet) return null

  return (
    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="font-display font-bold">PetGuardian</span>
        </div>
        <Badge className="bg-white/20 text-white">Pet ID</Badge>
      </div>

      <div className="flex gap-4">
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/20 flex-shrink-0">
          <img
            src={
              pet.image ||
              `https://ui-avatars.com/api/?name=${pet.name}&size=96&background=fff&color=22c55e`
            }
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold mb-1 truncate">{pet.name}</h3>
          <p className="text-white/80 mb-3">{pet.breed}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-white/60">Type:</span>
              <span className="ml-1 capitalize">{pet.type}</span>
            </div>
            <div>
              <span className="text-white/60">Gender:</span>
              <span className="ml-1 capitalize">{pet.gender}</span>
            </div>
            <div>
              <span className="text-white/60">Age:</span>
              <span className="ml-1">{calculateAge(pet.birthDate)}</span>
            </div>
            <div>
              <span className="text-white/60">Color:</span>
              <span className="ml-1">{pet.color || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/20">
        <p className="text-sm text-white/80 text-center">
          Scan QR code or visit petguardian.com/pet/{pet.id}
        </p>
      </div>
    </div>
  )
}

export default PetIDCard