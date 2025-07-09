import react from 'react'


const BMIStep = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <Calculator className="mx-auto text-green-600" size={48} />
        <h2 className="text-3xl font-bold text-green-800">BMI Calculator</h2>
        <p className="text-gray-600">Let's start with your basic measurements</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Units Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-full p-1 flex items-center space-x-1">
            <button
              onClick={() => {
                setUnits('metric');
                setFormData(prev => ({ ...prev, height: '', weight: '' }));
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                units === 'metric' 
                  ? 'bg-white shadow-md text-green-700 font-semibold' 
                  : 'text-gray-600'
              }`}
            >
              <span className="text-lg">🇬🇧</span>
              <span>Metric</span>
            </button>
            <button
              onClick={() => {
                setUnits('imperial');
                setFormData(prev => ({ ...prev, height: '', weight: '' }));
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                units === 'imperial' 
                  ? 'bg-white shadow-md text-green-700 font-semibold' 
                  : 'text-gray-600'
              }`}
            >
              <span className="text-lg">🇺🇸</span>
              <span>Imperial</span>
            </button>
          </div>
        </div>

        {/* Gender Selection */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-700">Gender</label>
          <div className="flex space-x-4 text-gray-600">
            {['male', 'female'].map(gender => (
              <button
                key={gender}
                onClick={() => setFormData(prev => ({ ...prev, gender }))}
                className={`flex-1 py-3 px-6 rounded-xl border-2 font-medium capitalize transition-all ${
                  formData.gender === gender 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <User className="inline mr-2" size={18} />
                {gender}
              </button>
            ))}
          </div>
        </div>
        
        {/* Age */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-700">Age (years)</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg text-gray-900 placeholder-gray-500"
            placeholder="Enter your age"
          />
        </div>
        
        {/* Height */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-700">
            Height ({units === 'metric' ? 'cm' : 'inches'})
          </label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg text-gray-900 placeholder-gray-500"
            placeholder={units === 'metric' ? 'Enter height in cm' : 'Enter height in inches'}
          />
        </div>
        
        {/* Weight */}
        <div className="space-y-3">
          <label className=" text-lg font-semibold text-gray-700">
            Weight ({units === 'metric' ? 'kg' : 'lbs'})
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg text-gray-900 placeholder-gray-500"
            placeholder={units === 'metric' ? 'Enter weight in kg' : 'Enter weight in lbs'}
          />
        </div>
      </div>
      
      <button
        onClick={handleNext}
        disabled={!formData.gender || !formData.age || !formData.height || !formData.weight}
        className="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
      >
        <span>Next Step</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );


  export default BMIStep;