import React, { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import SmileyRatingScale from '@/app/components/ui/SmileyRatingScale';
import RatingScale10 from '@/app/components/ui/RatingScale10';
import { contributionRolesKey } from '@/src/types';

interface GovernanceInfraToolingFormProps {
  rating1: number;
  smileyRating: number;
  feedback: string;
  setFeedback: (feedback: string) => void;
  extrafeedback: string;
  setExtraFeedback: (extraFeedback: string) => void;
  onSubmit: (formData: any) => void;
  onClose: () => void;
}

const GovernanceInfraToolingForm: React.FC<GovernanceInfraToolingFormProps> = ({
  rating1,
  smileyRating,
  feedback,
  setFeedback,
  extrafeedback,
  setExtraFeedback,
  onSubmit,
  onClose,
}) => {
  const [localRating1, setLocalRating1] = useState(rating1);
  const [localSmileyRating, setLocalSmileyRating] = useState(smileyRating);
  const [localFeedback, setLocalFeedback] = useState(feedback);
  const [localExtraFeedback, setLocalExtraFeedback] = useState(extrafeedback);

  const additionalInfo = [
    "The absence of this tool would significantly disrupt my work.",
    "The absence of this tool would cause considerable inconvenience.",
    "The absence of this tool would have little to no impact on my work.",
  ];


  const handleSubmit = () => {
    const formData = {
      likely_to_recommend: localRating1,
      feeling_if_didnt_exist: localSmileyRating,
      explanation: localFeedback,
      private_feedback: localExtraFeedback,
    };
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center" onClick={onClose}>
      <div
        className="relative m-auto p-6 bg-white rounded-lg shadow-lg max-w-4xl w-3/4 md:w-1/2 lg:w-2/3 max-h-[90vh] overflow-y-auto mx-4 md:mx-20"
        onClick={(e) => e.stopPropagation()}
      >
        <>
          <h2 className="text-xl font-bold mb-4 text-center">Attest to Contribution</h2>
          {/* <div className="mb-4">
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
          this will be present in another branch, dont need it for now, should be able to get this information from the persons wallet when they sign up*/}

          {/* Q1 */}
          <div className="mb-6">
            <h3 className='font-semibold text-center'>How likely are you to recommend this contribution to someone in your role or position?</h3>
            <RatingScale10 rating={localRating1} handleRating={setLocalRating1} />
          </div>
          <hr className="my-4" />

          {/* Q2 */}
          <div className="mb-6">
            <h3 className='font-semibold text-center'>How would you feel if this tool/contribution ceased to exist?</h3>
            <SmileyRatingScale 
              rating={localSmileyRating} 
              handleRating={setLocalSmileyRating} 
              additionalInfo={additionalInfo}
              />

          </div>
          <hr className="my-4" />

          {/* <div className="mb-4">
            <h3 className='font-semibold text-center mt-4'>Has this contribution been useful for your day-to-day role?</h3>
            <RatingScale rating={rating2} handleRating={handleRating2}/>
          </div> */}

          {/* <div className="mb-4">
            <h3 className='font-semibold text-center mt-4'>Has this contribution been useful for increasing accessibility to your governance functions?</h3>
            <RatingScale rating={rating3} handleRating={handleRating3}/>
          </div> */}

          {/* Q3 */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Please provide a brief explanation for your rating. For example, what aspects of this tool make it stand out from others, or what challenges do you face without it?</label>
            <textarea
              value={localFeedback}
              onChange={(e) => setLocalFeedback(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              rows={4}
              maxLength={200}
            />
            <div className="text-right text-xs text-gray-500 mt-1">{localFeedback.length}/200</div>
          </div>
          <hr className="my-4" />

          {/* Q4 */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Any additional feedback or suggestions on this contribution? This response will be confidential and only shared with the contributor.</label>
            <textarea
              value={localExtraFeedback}
              onChange={(e) => setLocalExtraFeedback(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              rows={4}
              maxLength={200}
            />
            <div className="text-right text-xs text-gray-500 mt-1">{localExtraFeedback.length}/200</div>
          </div>
          <hr className="my-4" />

          <div className="text-center py-3">
            <button className='btn bg-headerblack text-white hover:bg-blue-500 mr-2' onClick={onClose}>Back</button>
            <button className="btn bg-headerblack text-white hover:bg-blue-500" onClick={handleSubmit}>Send Review</button>
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