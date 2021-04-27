import { t } from '../../common/services/i18n';

const selfieIssues = t('kyc.failureReason.selfieVerificationFailed', {
  defaultValue:
    'The image of your face you provided does not meet the requirements. Please provide a clear, color, non-cropped picture of your face taken with a camera.',
});

export const KYC_FAILURE_REASONS = {
  // general issues
  DENIED_UNSUPPORTED_ID_COUNTRY: t('kyc.failureReason.deniedUnsupportedIdCountry', {
    defaultValue:
      'Sorry, your country is restricted at this time. Our platform and token sale are closed to US citizens and residents, but we will notify you when that changes.',
  }),
  DENIED_UNSUPPORTED_ID_TYPE: t('kyc.failureReason.deniedUnsupportedIdType', {
    defaultValue:
      'Sorry, the form of ID that you uploaded is not of a supported type. Please supply a government issued id.',
  }),

  // selfie issues (TODO: better error messages!)
  NO_SELFIE_MATCH: selfieIssues,
  SELFIE_CROPPED_FROM_ID: selfieIssues,
  ENTIRE_ID_USED_AS_SELFIE: selfieIssues,
  MULTIPLE_PEOPLE: selfieIssues,
  SELFIE_IS_SCREEN_PAPER_VIDEO: selfieIssues,
  SELFIE_MANIPULATED: selfieIssues,
  AGE_DIFFERENCE_TOO_BIG: selfieIssues,
  NO_FACE_PRESENT: selfieIssues,
  FACE_NOT_FULLY_VISIBLE: selfieIssues,
  BAD_QUALITY: selfieIssues,
  BLACK_AND_WHITE: selfieIssues,

  // unreadable id
  PHOTOCOPY_BLACK_WHITE: t('kyc.failureReason.photocopyBlackWhite', {
    defaultValue:
      'A black and white photocopied version of your ID is not acceptable for identity verification. Please upload an original color photo of your ID, taken with a camera.',
  }),
  PHOTOCOPY_COLOR: t('kyc.failureReason.photocopyColor', {
    defaultValue:
      'A photocopied version of your ID is not acceptable for identity verification. Please upload an original color photo of your ID, taken with a camera.',
  }),
  DIGITAL_COPY: t('kyc.failureReason.digitalCopy', {
    defaultValue:
      'Please upload an original color photo of your ID. Photos of IDs displayed on screens are not permitted.',
  }),
  NO_DOCUMENT: t('kyc.failureReason.noDocument', {
    defaultValue: 'Please upload an original color photo of your ID, taken with a camera.',
  }),
  MISSING_BACK: t('kyc.failureReason.missingBack', {
    defaultValue: 'Please upload an original color photo of the back of your original ID.',
  }),
  WRONG_DOCUMENT_PAGE: t('kyc.failureReason.wrongDocumentPage', {
    defaultValue:
      'The file you uploaded is not acceptable for identity verification. Please upload an original color photo of your ID, taken with a camera.',
  }),
  MISSING_SIGNATURE: t('kyc.failureReason.missingSignature', {
    defaultValue:
      'The file you uploaded is missing a signature. Please upload an original color photo of your ID with a valid signature.',
  }),
  CAMERA_BLACK_WHITE: t('kyc.failureReason.cameraBlackWhite', {
    defaultValue: 'Please upload a color photo of your ID, taken with a camera.',
  }),
  DIFFERENT_PERSONS_SHOWN: t('kyc.failureReason.differentPersonsShown', {
    defaultValue: 'Your photo contains multiple people. Please upload a photo only of yourself.',
  }),
  NOT_READABLE_DOCUMENT_BLURRED: t('kyc.failureReason.blurred', {
    defaultValue:
      'A clear photo is required for identity verification. Please upload a clear, original color photo of your ID, taken with a camera.',
  }),
  NOT_READABLE_DOCUMENT_BAD_QUALITY: t('kyc.failureReason.badQuality', {
    defaultValue:
      'A high-resolution photo is required for identity verification. Please upload a clear, original color photo of your ID, taken with a camera.',
  }),
  NOT_READABLE_DOCUMENT_MISSING_PART_DOCUMENT: t('kyc.failureReason.missingPartDocument', {
    defaultValue:
      'The document you uploaded is missing information. Please upload an original color photo of your entire ID with a valid signature.',
  }),
  NOT_READABLE_DOCUMENT_HIDDEN_PART_DOCUMENT: t('kyc.failureReason.hiddenPartDocument', {
    defaultValue:
      'The document you uploaded is missing information. Please upload an original color photo of your entire ID with a valid signature.',
  }),
  NOT_READABLE_DOCUMENT_DAMAGED_DOCUMENT: t('kyc.failureReason.damagedDocument', {
    defaultValue:
      'The document you uploaded is damaged. Please upload a different original color photo of your entire ID with a valid signature.',
  }),
};
