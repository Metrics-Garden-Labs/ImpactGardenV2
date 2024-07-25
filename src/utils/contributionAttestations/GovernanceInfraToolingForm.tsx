import React from 'react';
import RatingScale from '@/app/components/RatingScale';
import { RxCross2 } from 'react-icons/rx';
import { contributionRolesKey } from '@/src/types';

interface GovernanceInfraToolingFormProps {
  handleRating1: (rate: number) => void;
  handleRating2: (rate: number) => void;
  handleRating3: (rate: number) => void;
  rating1: number;
  rating2: number;
  rating3: number;
  contributionRoles: { [key in contributionRolesKey]: boolean };
  handleClick: (key: contributionRolesKey) => void;
  labels: { [key in contributionRolesKey]: string };
  feedback: string;
  setFeedback: (feedback: string) => void;
  extrafeedback: string;
  setExtraFeedback: (extraFeedback: string) => void;
  onClose: () => void;
  // createAttestation: () => void;
}


const GovernanceInfraToolingForm: React.FC<GovernanceInfraToolingFormProps> = ({
  handleRating1,
  handleRating2,
  handleRating3,
  rating1,
  rating2,
  rating3,
  contributionRoles,
  handleClick,
  labels,
  feedback,
  setFeedback,
  extrafeedback,
  setExtraFeedback,
  onClose,
  // createAttestation
}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center" onClick={onClose}>
      <div
        className="relative m-auto p-8 bg-white rounded-lg shadow-lg max-w-4xl w-3/4 md:w-1/2 lg:w-1/3 max-h-[90vh] overflow-y-auto mx-4 md:mx-20"
        onClick={(e) => e.stopPropagation()}
      >
        <>
          <h2 className="text-xl font-bold mb-4 text-center">Attest to Contribution</h2>
          <div className="mb-4">
            <h3 className="font-semibold text-center">Please select the roles you perform within Optimism's Governance for which this contribution has been impactful. Select all that apply.</h3>
            <div className='font-semibold text-center mt-4'>
              {Object.entries(contributionRoles).map(([key, value]) => (
                <button 
                  key={key}
                  onClick={() => handleClick(key as contributionRolesKey)}
                  className={`mb-2 px-4 py-2 rounded-lg w-full text-left text-sm ${value ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  {value ? '✓' : '+'} {labels[key as contributionRolesKey]}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className='font-semibold text-center mt-4'>How likely are you to recommend this contribution to someone in your role or an ecosystem participant?</h3>
            <RatingScale rating={rating1} handleRating={handleRating1}/>
          </div>

          <div className="mb-4">
            <h3 className='font-semibold text-center mt-4'>Has this contribution been useful for your day-to-day role?</h3>
            <RatingScale rating={rating2} handleRating={handleRating2}/>
          </div>

          {/* <div className="mb-4">
            <h3 className='font-semibold text-center mt-4'>Has this contribution been useful for increasing accessibility to your governance functions?</h3>
            <RatingScale rating={rating3} handleRating={handleRating3}/>
          </div> */}

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Please provide a brief explanation of your ratings:</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              rows={4}
              maxLength={200}
            />
            <div className="text-right mr-2">{feedback.length}/200</div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Any additional feedback or suggestions?</label>
            <textarea
              value={extrafeedback}
              onChange={(e) => setExtraFeedback(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              rows={4}
              maxLength={200}
            />
            <div className="text-right mr-2">{extrafeedback.length}/200</div>
          </div>

          <div className="mb-4 text-center py-3 p-3">
            <button className='btn text-center bg-headerblack text-white hover:bg-blue-500 mr-4' onClick={onClose}>Back</button>
            {/* <button className="btn text-center bg-headerblack text-white hover:bg-blue-500 " onClick={createAttestation}>Send Review</button> */}
            <button className="btn text-center bg-headerblack text-white hover:bg-blue-500 " >Send Review</button>
          </div>
        </>
        <button onClick={onClose} className="text-black absolute top-0 right-0 w-5 h-5 mt-4 mr-4">
          <RxCross2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default GovernanceInfraToolingForm;
