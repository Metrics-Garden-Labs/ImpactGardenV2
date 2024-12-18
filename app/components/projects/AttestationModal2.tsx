"use client";

//TODO: test the new compiled data

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { NEXT_PUBLIC_URL } from "@/src/config/config";
import useLocalStorage from "@/src/hooks/use-local-storage-state";
import AttestationCreationModal from "../ui/AttestationCreationModal";
import AttestationConfirmationModal from "../ui/AttestationConfirmationModal";
import { Contribution, Project } from "@/src/types";
import GovernanceInfraToolingForm from "../attestations/governanceAttestationForms/GovernanceInfraToolingForm";
import GovernanceRAndAForm from "../attestations/governanceAttestationForms/GovernanceR&A";
import GovernanceCollabAndOnboarding from "../attestations/governanceAttestationForms/GovernanceCollabAndOnboarding";
import GovernanceStructuresFrom from "../attestations/governanceAttestationForms/GovernanceStructures";
import OnchainBuildersForm from "@/app/components/attestations/onchainBuildersAttstationForms/attestationForm";
import OPStackForm from "@/app/components/attestations/opStack/opstackattestationform";
import { useEAS } from "../../../src/hooks/useEAS";
import { easScanEndpoints } from "@/src/utils/easScan";
import AttestationModal from "./AttestationModal";
import { usePinataUpload } from "@/src/hooks/usePinataUpload";
import { useDelegatedAttestation } from "@/src/hooks/useDelegatedAttestation";
import {
  SchemaEncoder,
  ZERO_ADDRESS,
} from "@ethereum-attestation-service/eas-sdk";
import { isAddress, zeroAddress } from "viem";
import { useNormalAttestation } from "@/src/hooks/useNormalAttestation";
import { useAccount } from "wagmi";
import useSWR from "swr";
import { getFIDbyAddress } from "./actions";

interface AttestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contribution: Contribution | null;
  onSubmit?: () => void;
  project: Project | null;
  className?: string;
}

const AttestationModal2: React.FC<AttestationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contribution,
  project,
  className,
}) => {
  const { address } = useAccount();

  const [feedback, setFeedback] = useState("");
  const [feedback2, setFeedback2] = useState("");
  const [extrafeedback, setExtraFeedback] = useState("");
  const [rating1, setRating1] = useState(0);
  const [rating2, setRating2] = useState(0);
  const [rating3, setRating3] = useState(0);
  const [smileyRating, setSmileyRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [attestationUID, setAttestationUID] = useState<string | null>(null);
  // const [showReviewCarousel, setShowReviewCarousel] = useState(false);

  const { eas, currentAddress } = useEAS();
  const [user] = useLocalStorage("user", {
    username: "",
    ethAddress: "",
  });

  const { data: fid = null } = useSWR(
    address ? `fid.${address}` : null,
    async () => {
      if (!address) return null;
      const fid = await getFIDbyAddress(address);
      return fid;
    }
  );

  console.debug({ fid });

  const { uploadToPinata, isUploading } = usePinataUpload();
  // const { createDelegatedAttestation, isCreating: isCreatingDelegated } = useDelegatedAttestation();
  const { createNormalAttestation, isCreating: isCreatingNormal } =
    useNormalAttestation();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      router.push(`${pathname}?contribution=${contribution?.id}`);
      console.log("Contribution:", contribution);
      console.log("Contribution Category:", contribution?.category);
      console.log("Contribution Subcategory:", contribution?.subcategory);
    } else {
      router.push(pathname);
    }
  }, [isOpen, contribution?.id, router, pathname]);

  // useEffect(() => {
  //   if (showReviewCarousel) {
  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     document.body.style.overflow = 'unset';
  //   }

  //   return () => {
  //     document.body.style.overflow = 'unset';
  //   };
  // }, [showReviewCarousel]);

  const isValidEthereumAddress = (address: string | undefined): boolean => {
    if (!address) return false;
    return isAddress(address);
  };

  const createAttestation = async (pinataURL: string): Promise<string> => {
    if (!fid) {
      throw alert("Please Connect to Farcaster to Continue");
    }

    const schema =
      "0xc9bc703e3c48be23c1c09e2f58b2b6657e42d8794d2008e3738b4ab0e2a3a8b6";
    const schemaEncoder = new SchemaEncoder(
      "bytes32 contributionRegUID, bytes32 projectRegUID, uint256 farcasterID, string issuer, string metadataurl"
    );
    const encodedData = schemaEncoder.encodeData([
      {
        name: "contributionRegUID",
        type: "bytes32",
        value: contribution?.primarycontributionuid || "",
      },
      {
        name: "projectRegUID",
        type: "bytes32",
        value: project?.primaryprojectuid || "",
      },
      { name: "farcasterID", type: "uint256", value: fid },
      { name: "issuer", type: "string", value: "MGL" },
      { name: "metadataurl", type: "string", value: pinataURL },
    ]);

    try {
      const recipientAddress =
        project?.ethAddress && isValidEthereumAddress(project.ethAddress)
          ? project.ethAddress
          : ZERO_ADDRESS;
      const attestationUID = await createNormalAttestation(
        schema,
        encodedData,
        recipientAddress,
        contribution?.easUid || contribution?.primarycontributionuid || ""
      );

      return attestationUID;
    } catch (error) {
      console.error("Error in createAttestation:", error);
      throw error;
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setIsLoading(true);
      console.log("Form submitted, creating attestation...");
      console.log("formData", formData);

      let specificData;
      let compiledData;

      switch (contribution?.category) {
        case "Governance":
          switch (contribution?.subcategory) {
            case "Collaboration & Onboarding":
              specificData = {
                governance_knowledge: formData.governance_knowledge,
                governance_knowledge_number:
                  formData.governance_knowledge_number,
                recommend_contribution: formData.recommend_contribution,
                feeling_if_didnt_exist: formData.feeling_if_didnt_exist,
                feeling_if_didnt_exist_number:
                  formData.feeling_if_didnt_exist_number,
                explanation: formData.explanation,
                round: "RF6",
              };
              break;
            case "Infra & Tooling":
              specificData = {
                likely_to_recommend: formData.likely_to_recommend,
                feeling_if_didnt_exist: formData.feeling_if_didnt_exist,
                feeling_if_didnt_exist_number:
                  formData.feeling_if_didnt_exist_number || "",
                explanation: formData.explanation,
                round: "RF6",
              };
              break;
            case "Governance Research & Analytics":
              specificData = {
                likely_to_recommend: formData.likely_to_recommend,
                useful_for_understanding: formData.useful_for_understanding,
                effective_for_improvements: formData.effective_for_improvements,
                explanation: formData.explanation,
                round: "RF6",
              };
              break;
            case "Governance Leadership":
              specificData = {
                name: "Feeling if didnt exist",
                feeling_if_didnt_exist: formData.feeling_if_didnt_exist,
                why: formData.why,
                explanation: formData.explanation,
                round: "RF6",
              };
              break;
            default:
              throw new Error("Unknown subcategory");
          }
          //TODO::likely to recommend and recommend contribution are the same thing, can change them to be the same
          compiledData = {
            id: contribution?.id,
            project: {
              name: project?.projectName,
              description: project?.oneliner,
              website: project?.websiteUrl,
            },
            reviewer: {
              userFID: fid,
              ethAddress: user.ethAddress || zeroAddress,
            },
            context: {
              ecosystems: [
                {
                  name: contribution?.ecosystem,
                  tags: [
                    {
                      category: contribution?.category,
                      subcategory: contribution?.subcategory,
                      round: specificData.round,
                    },
                  ],
                },
              ],
              userInterface: "Impact Garden",
            },
            contributions: [
              {
                name: contribution?.projectName,
                description: contribution?.contribution,
                website: project?.websiteUrl,
              },
            ],
            impactAttestations: [
              {
                name: "Likely to Recommend",
                type: "numeric",
                value:
                  specificData?.likely_to_recommend ||
                  specificData?.recommend_contribution ||
                  "",
              },
              {
                name: "Feeling if didnt exist",
                type: "numeric",
                value: specificData?.feeling_if_didnt_exist_number || "",
              },
              {
                name: "Governance Knowledge",
                type: "numeric",
                value: specificData?.governance_knowledge_number || "",
              },
              {
                name: "Useful for Understanding",
                type: "numeric",
                value: specificData?.useful_for_understanding || "",
              },
              {
                name: "Effective for Improvements",
                type: "numeric",
                value: specificData?.effective_for_improvements || "",
              },
              {
                name: "Why Effective for Improvements",
                type: "string",
                value: specificData?.why || "",
              },
              {
                name: "Text Review",
                type: "string",
                value: specificData?.explanation || "",
              },
            ],
          };
          break;

        // For non-Governance categories, use the default specificData
        case "Onchain Builders":
          specificData = {
            likely_to_recommend: formData.likely_to_recommend,
            feeling_if_didnt_exist: formData.feeling_if_didnt_exist,
          };
          break;
        case "OP Stack":
          specificData = {
            feeling_if_didnt_exist: formData.feeling_if_didnt_exist,
            explanation: formData.explanation,
          };
          break;
        default:
          throw new Error("Unknown category");
      }

      console.log("Specific Data:", specificData);

      const pinataURL = await uploadToPinata(compiledData || specificData); // Upload compiledData for Governance, specificData for others
      if (!pinataURL) throw new Error("Failed to upload data to IPFS");

      const attestationUID = await createAttestation(pinataURL);
      if (!attestationUID) throw new Error("Failed to create attestation");

      console.log("Attestation created with UID:", attestationUID);
      setAttestationUID(attestationUID);

      // setShowReviewCarousel(true);
      setIsLoading(false);

      const attestationData = {
        userfid: fid,
        ethaddress: user.ethAddress || zeroAddress,
        projectName: contribution.projectName,
        contribution: contribution.contribution,
        category: contribution.category,
        subcategory: contribution.subcategory,
        ecosystem: contribution.ecosystem,
        attestationUID: attestationUID,
        ...formData,
      };

      console.log("Attestation Data:", attestationData);

      const response = await fetch(`${NEXT_PUBLIC_URL}/api/addAttestation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attestationData),
      });

      onSubmit?.();

      if (!response.ok) {
        throw new Error("Failed to submit attestation");
      }

      const result = await response.json();
      console.log("Submission result:", result);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsLoading(false);
    }
  };

  // const handleReviewCarouselClose = () => {
  //   console.log('ReviewCarousel onClose called');
  //   setShowReviewCarousel(false);
  //   setAttestationUID(null);
  //   onClose();
  // };

  // console.log('Current state:', { isOpen, showReviewCarousel, attestationUID, isLoading });

  if (!isOpen) return null;

  const renderForm = () => {
    switch (contribution?.category) {
      case "Governance":
        switch (contribution?.subcategory) {
          case "Infra & Tooling":
            return (
              <GovernanceInfraToolingForm
                onSubmit={handleFormSubmit}
                onClose={onClose}
                className={className}
              />
            );
          case "Governance Research & Analytics":
            return (
              <GovernanceRAndAForm
                rating1={rating1}
                rating2={rating2}
                rating3={rating3}
                feedback={feedback}
                setFeedback={setFeedback}
                extrafeedback={extrafeedback}
                setExtraFeedback={setExtraFeedback}
                onSubmit={handleFormSubmit}
                onClose={onClose}
              />
            );
          case "Collaboration & Onboarding":
            return (
              <GovernanceCollabAndOnboarding
                smileyRating={smileyRating}
                rating1={rating1}
                feedback={feedback}
                extrafeedback={extrafeedback}
                setFeedback={setFeedback}
                setExtraFeedback={setExtraFeedback}
                onSubmit={handleFormSubmit}
                onClose={onClose}
              />
            );
          case "Governance Leadership":
            return (
              <GovernanceStructuresFrom
                smileyRating={smileyRating}
                feedback={feedback}
                setFeedback={setFeedback}
                feedback2={feedback2}
                setFeedback2={setFeedback2}
                extrafeedback={extrafeedback}
                setExtraFeedback={setExtraFeedback}
                onSubmit={handleFormSubmit}
                onClose={onClose}
              />
            );
        }
        break;
      case "Onchain Builders":
        return (
          <OnchainBuildersForm
            smileyRating={smileyRating}
            rating1={rating1}
            feedback={feedback}
            setFeedback={setFeedback}
            extrafeedback={extrafeedback}
            setExtraFeedback={setExtraFeedback}
            onSubmit={handleFormSubmit}
            onClose={onClose}
          />
        );
      case "OP Stack":
        return (
          <OPStackForm
            smileyRating={smileyRating}
            feedback={feedback}
            setFeedback={setFeedback}
            onSubmit={handleFormSubmit}
            onClose={onClose}
          />
        );
      default:
        return (
          <AttestationModal
            contribution={contribution}
            project={project}
            onClose={onClose}
            isOpen={isOpen}
          />
        );
    }
    return null;
  };

  return (
    <div>
      {renderForm()}
      {isLoading && <AttestationCreationModal />}
      {attestationUID && (
        <AttestationConfirmationModal
          attestationUID={attestationUID}
          attestationType={contribution}
          setAttestationUID={setAttestationUID}
          easScanEndpoints={easScanEndpoints}
          onClose={onClose}
        />
      )}
    </div>
    // <div className="fixed inset-0 z-50 flex flex-col bg-white">
    //   <Navbar />
    //   <div className="flex-grow overflow-y-auto">
    //     {!showReviewCarousel && renderForm()}
    //     {isLoading && <AttestationCreationModal />}
    //     {showReviewCarousel && attestationUID && (
    //       // <ReviewConfirmationPage
    //       //   reviewedProject={project}
    //       //   userFid={user.fid}
    //       //   attestationUID={attestationUID}
    //       //   attestationType={contribution}
    //       //   easScanEndpoints={easScanEndpoints}
    //       //   reviewedContribution={contribution}
    //       //   onClose={handleReviewCarouselClose}
    //       // />
    //       <AttestationConfirmationModal
    //         attestationUID={attestationUID}
    //         attestationType={contribution}
    //         setAttestationUID={setAttestationUID}
    //         easScanEndpoints={easScanEndpoints}
    //       />
    //     )}
    //   </div>
    // </div>
  );
};

export default AttestationModal2;
