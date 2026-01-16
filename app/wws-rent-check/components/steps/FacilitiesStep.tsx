'use client'

import { WWSFormData, KitchenAppliance, SanitaryFacility, KitchenCounterLength, ToiletType, HeatingType } from '@/lib/wws-calculator/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface FacilitiesStepProps {
  formData: WWSFormData
  onChange: (updates: Partial<WWSFormData>) => void
  onNext: () => void
}

// Point values for kitchen appliances
const KITCHEN_APPLIANCE_POINTS: Record<string, number> = {
  'hob-induction': 1.75,
  'hob-ceramic': 1.0,
  'hob-gas': 0.5,
  'extractor-hood': 0.75,
  'fridge': 1.0,
  'freezer': 0.75,
  'oven-electric': 1.0,
  'oven-combi': 1.0,
  'dishwasher': 1.5,
}

// Point values for sanitary facilities
const SANITARY_FACILITY_POINTS: Record<string, number> = {
  'washbasin': 1.0,
  'multi-washbasin': 1.5,
  'shower': 4.0,
  'bath': 6.0,
  'bath-separate-shower': 7.0,
}

export function FacilitiesStep({ formData, onChange, onNext }: FacilitiesStepProps) {
  const isNonIndependent = formData.housingType === 'non-independent'

  // Kitchen validation
  const kitchenValid = formData.kitchenCounterLength !== null &&
    (!isNonIndependent || (formData.kitchenShared !== null && (!formData.kitchenShared || formData.kitchenNumSharers !== null)))

  // Sanitary validation
  const sanitaryValid = formData.toiletType !== null &&
    formData.heatingType !== null &&
    formData.numHeatedRooms !== null &&
    (!isNonIndependent || (formData.sanitaryShared !== null && (!formData.sanitaryShared || formData.sanitaryNumSharers !== null)))

  const canProceed = kitchenValid && sanitaryValid

  const handleKitchenApplianceToggle = (applianceType: string, checked: boolean) => {
    const points = KITCHEN_APPLIANCE_POINTS[applianceType]
    if (!points) return

    let appliances = [...formData.kitchenAppliances]
    if (checked) {
      appliances.push({ type: applianceType as any, points })
    } else {
      appliances = appliances.filter(a => a.type !== applianceType)
    }
    onChange({ kitchenAppliances: appliances })
  }

  const handleSanitaryFacilityToggle = (facilityType: string, checked: boolean) => {
    const points = SANITARY_FACILITY_POINTS[facilityType]
    if (!points) return

    let facilities = [...formData.sanitaryFacilities]
    if (checked) {
      facilities.push({ type: facilityType as any, points })
    } else {
      facilities = facilities.filter(f => f.type !== facilityType)
    }
    onChange({ sanitaryFacilities: facilities })
  }

  const hasAppliance = (type: string) => formData.kitchenAppliances.some(a => a.type === type)
  const hasFacility = (type: string) => formData.sanitaryFacilities.some(f => f.type === type)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white border-2 border-brand-border rounded-2xl shadow-elev-2 p-6 sm:p-8 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text mb-4">
            Facilities [Voorzieningen]
          </h2>
          <p className="text-brand-muted text-lg">
            Kitchen and sanitary facilities
          </p>
        </div>

        <div className="space-y-8 mb-8">
          {/* Kitchen Section */}
          <div className="border-b border-brand-border pb-6">
            <h3 className="text-xl font-bold text-brand-text mb-4">Kitchen [Keuken]</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-brand-text font-semibold mb-2">
                  Counter Length [Aanrechtblad]
                </label>
                <p className="text-brand-muted text-sm mb-3">
                  Measure including the sink and hob (NEW 2025 Rule)
                </p>
                <div className="flex gap-4">
                  {(['<1m', '1-2m', '≥2m'] as KitchenCounterLength[]).map((length) => (
                    <button
                      key={length}
                      type="button"
                      onClick={() => onChange({ kitchenCounterLength: length })}
                      className={cn(
                        'flex-1 h-14 rounded-xl font-semibold text-lg transition-all',
                        formData.kitchenCounterLength === length
                          ? 'bg-brand-primary text-white shadow-lg hover:bg-brand-primaryHover'
                          : 'bg-white border-2 border-brand-border text-brand-text hover:bg-brand-primary/5 hover:border-brand-primary'
                      )}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-brand-text font-semibold mb-2">
                  Built-in Appliances [Inbouwapparatuur]
                </label>
                <p className="text-brand-muted text-sm mb-3">
                  Must be built-in, not loose
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hob-induction"
                      checked={hasAppliance('hob-induction')}
                      onCheckedChange={(checked) => handleKitchenApplianceToggle('hob-induction', checked as boolean)}
                    />
                    <label htmlFor="hob-induction" className="text-brand-text cursor-pointer">
                      Induction Hob (1.75 pts)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hob-ceramic"
                      checked={hasAppliance('hob-ceramic')}
                      onCheckedChange={(checked) => handleKitchenApplianceToggle('hob-ceramic', checked as boolean)}
                    />
                    <label htmlFor="hob-ceramic" className="text-brand-text cursor-pointer">
                      Ceramic Hob (1.0 pts)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hob-gas"
                      checked={hasAppliance('hob-gas')}
                      onCheckedChange={(checked) => handleKitchenApplianceToggle('hob-gas', checked as boolean)}
                    />
                    <label htmlFor="hob-gas" className="text-brand-text cursor-pointer">
                      Gas Hob (0.5 pts)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extractor-hood"
                      checked={hasAppliance('extractor-hood')}
                      onCheckedChange={(checked) => handleKitchenApplianceToggle('extractor-hood', checked as boolean)}
                    />
                    <label htmlFor="extractor-hood" className="text-brand-text cursor-pointer">
                      Extractor Hood [Afzuigkap] (0.75 pts)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fridge"
                      checked={hasAppliance('fridge')}
                      onCheckedChange={(checked) => handleKitchenApplianceToggle('fridge', checked as boolean)}
                    />
                    <label htmlFor="fridge" className="text-brand-text cursor-pointer">
                      Fridge [Koelkast] (1.0 pts)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="freezer"
                      checked={hasAppliance('freezer')}
                      onCheckedChange={(checked) => handleKitchenApplianceToggle('freezer', checked as boolean)}
                    />
                    <label htmlFor="freezer" className="text-brand-text cursor-pointer">
                      Freezer [Vrieskast] (0.75 pts)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="oven-electric"
                      checked={hasAppliance('oven-electric')}
                      onCheckedChange={(checked) => handleKitchenApplianceToggle('oven-electric', checked as boolean)}
                    />
                    <label htmlFor="oven-electric" className="text-brand-text cursor-pointer">
                      Electric Oven (1.0 pts)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="oven-combi"
                      checked={hasAppliance('oven-combi')}
                      onCheckedChange={(checked) => handleKitchenApplianceToggle('oven-combi', checked as boolean)}
                    />
                    <label htmlFor="oven-combi" className="text-brand-text cursor-pointer">
                      Combi-Oven/Microwave (1.0 pts)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dishwasher"
                      checked={hasAppliance('dishwasher')}
                      onCheckedChange={(checked) => handleKitchenApplianceToggle('dishwasher', checked as boolean)}
                    />
                    <label htmlFor="dishwasher" className="text-brand-text cursor-pointer">
                      Dishwasher (1.5 pts) - only if built-in
                    </label>
                  </div>
                </div>
              </div>

              {isNonIndependent && (
                <div className="space-y-4 pt-4 border-t border-brand-border">
                  <div>
                    <label className="block text-brand-text font-semibold mb-2">
                      Is kitchen private or shared?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => onChange({ kitchenShared: false })}
                        className={cn(
                          'flex-1 h-12 rounded-xl font-semibold transition-all',
                          formData.kitchenShared === false
                            ? 'bg-brand-primary text-white shadow-lg hover:bg-brand-primaryHover'
                            : 'bg-white border-2 border-brand-border text-brand-text hover:bg-brand-primary/5 hover:border-brand-primary'
                        )}
                      >
                        Private
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange({ kitchenShared: true })}
                        className={cn(
                          'flex-1 h-12 rounded-xl font-semibold transition-all',
                          formData.kitchenShared === true
                            ? 'bg-brand-primary text-white shadow-lg hover:bg-brand-primaryHover'
                            : 'bg-white border-2 border-brand-border text-brand-text hover:bg-brand-primary/5 hover:border-brand-primary'
                        )}
                      >
                        Shared
                      </button>
                    </div>
                  </div>
                  {formData.kitchenShared && (
                    <div>
                      <label className="block text-brand-text font-semibold mb-2">
                        <strong>How many households share this kitchen? (including yourself)</strong>
                      </label>
                      <Input
                        type="number"
                        value={formData.kitchenNumSharers ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseInt(e.target.value, 10)
                          onChange({ kitchenNumSharers: value })
                        }}
                        placeholder="Enter number"
                        min="2"
                        className="h-14 text-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sanitary Section */}
          <div>
            <h3 className="text-xl font-bold text-brand-text mb-4">Sanitary [Sanitair]</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-brand-text font-semibold mb-2">
                  Toilet Type
                </label>
                <div className="flex gap-4">
                  {([
                    { value: 'standard' as ToiletType, label: 'Standard (3.0 pts)' },
                    { value: 'hanging' as ToiletType, label: 'Hanging [Wandcloset] (3.75 pts)' },
                    { value: 'sanibroyeur' as ToiletType, label: 'Sanibroyeur (1.0 pts)' },
                  ]).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onChange({ toiletType: value })}
                      className={cn(
                        'flex-1 h-14 rounded-xl font-semibold text-sm transition-all',
                        formData.toiletType === value
                          ? 'bg-brand-primary text-white shadow-lg hover:bg-brand-primaryHover'
                          : 'bg-white border-2 border-brand-border text-brand-text hover:bg-brand-primary/5 hover:border-brand-primary'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <Checkbox
                    id="toilet-in-bathroom"
                    checked={formData.toiletInBathroom}
                    onCheckedChange={(checked) => onChange({ toiletInBathroom: checked as boolean })}
                  />
                  <label htmlFor="toilet-in-bathroom" className="text-brand-text cursor-pointer text-sm">
                    Is toilet inside the bathroom? (-1 pt penalty)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-brand-text font-semibold mb-2">
                  Washing Facilities
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="washbasin"
                      checked={hasFacility('washbasin')}
                      onCheckedChange={(checked) => handleSanitaryFacilityToggle('washbasin', checked as boolean)}
                    />
                    <label htmlFor="washbasin" className="text-brand-text cursor-pointer">
                      Washbasin [Wastafel] (1.0 pts)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multi-washbasin"
                      checked={hasFacility('multi-washbasin')}
                      onCheckedChange={(checked) => handleSanitaryFacilityToggle('multi-washbasin', checked as boolean)}
                    />
                    <label htmlFor="multi-washbasin" className="text-brand-text cursor-pointer">
                      Multi-person Washbasin (2 taps, &gt;70cm) (1.5 pts)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shower"
                      checked={hasFacility('shower')}
                      onCheckedChange={(checked) => handleSanitaryFacilityToggle('shower', checked as boolean)}
                    />
                    <label htmlFor="shower" className="text-brand-text cursor-pointer">
                      Shower (4.0 pts)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bath"
                      checked={hasFacility('bath')}
                      onCheckedChange={(checked) => handleSanitaryFacilityToggle('bath', checked as boolean)}
                    />
                    <label htmlFor="bath" className="text-brand-text cursor-pointer">
                      Bath (6.0 pts)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bath-separate-shower"
                      checked={hasFacility('bath-separate-shower')}
                      onCheckedChange={(checked) => handleSanitaryFacilityToggle('bath-separate-shower', checked as boolean)}
                    />
                    <label htmlFor="bath-separate-shower" className="text-brand-text cursor-pointer">
                      Bath + Separate Shower (7.0 pts)
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-brand-text font-semibold mb-2">
                  Heating [Verwarming]
                </label>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    {([
                      { value: 'central' as HeatingType, label: 'Central/District (2.0 pts/room)' },
                      { value: 'gas' as HeatingType, label: 'Gas Heater [Gaskachel] (1.0 pt/room)' },
                    ]).map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => onChange({ heatingType: value })}
                        className={cn(
                          'flex-1 h-14 rounded-xl font-semibold text-sm transition-all',
                          formData.heatingType === value
                            ? 'bg-brand-primary text-white shadow-lg hover:bg-brand-primaryHover'
                            : 'bg-white border-2 border-brand-border text-brand-text hover:bg-brand-primary/5 hover:border-brand-primary'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {formData.heatingType && (
                    <div>
                      <label className="block text-brand-text font-semibold mb-2">
                        Number of heated rooms
                      </label>
                      <Input
                        type="number"
                        value={formData.numHeatedRooms ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseInt(e.target.value, 10)
                          onChange({ numHeatedRooms: value })
                        }}
                        placeholder="Enter number"
                        min="1"
                        className="h-14 text-lg"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="thermostat-valves"
                      checked={formData.thermostatValves}
                      onCheckedChange={(checked) => onChange({ thermostatValves: checked as boolean })}
                    />
                    <label htmlFor="thermostat-valves" className="text-brand-text cursor-pointer">
                      Thermostat valves on radiators? (+0.25 pts per radiator)
                    </label>
                  </div>
                  {formData.thermostatValves && (
                    <div>
                      <label className="block text-brand-text font-semibold mb-2">
                        Number of thermostat valves
                      </label>
                      <Input
                        type="number"
                        value={formData.numThermostatValves ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseInt(e.target.value, 10)
                          onChange({ numThermostatValves: value })
                        }}
                        placeholder="Enter number"
                        min="0"
                        className="h-14 text-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {isNonIndependent && (
                <div className="space-y-4 pt-4 border-t border-brand-border">
                  <div>
                    <label className="block text-brand-text font-semibold mb-2">
                      Are sanitary facilities private or shared?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => onChange({ sanitaryShared: false })}
                        className={cn(
                          'flex-1 h-12 rounded-xl font-semibold transition-all',
                          formData.sanitaryShared === false
                            ? 'bg-brand-primary text-white shadow-lg hover:bg-brand-primaryHover'
                            : 'bg-white border-2 border-brand-border text-brand-text hover:bg-brand-primary/5 hover:border-brand-primary'
                        )}
                      >
                        Private
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange({ sanitaryShared: true })}
                        className={cn(
                          'flex-1 h-12 rounded-xl font-semibold transition-all',
                          formData.sanitaryShared === true
                            ? 'bg-brand-primary text-white shadow-lg hover:bg-brand-primaryHover'
                            : 'bg-white border-2 border-brand-border text-brand-text hover:bg-brand-primary/5 hover:border-brand-primary'
                        )}
                      >
                        Shared
                      </button>
                    </div>
                  </div>
                  {formData.sanitaryShared && (
                    <div>
                      <label className="block text-brand-text font-semibold mb-2">
                        <strong>How many households share? (including yourself)</strong>
                      </label>
                      <Input
                        type="number"
                        value={formData.sanitaryNumSharers ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseInt(e.target.value, 10)
                          onChange({ sanitaryNumSharers: value })
                        }}
                        placeholder="Enter number"
                        min="2"
                        className="h-14 text-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className={cn(
              'h-12 px-8 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-xl shadow-lg shadow-brand-primary/20',
              !canProceed && 'opacity-50 cursor-not-allowed'
            )}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}



