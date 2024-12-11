// candidate: {
//     id: 5,
//     nickname: "เม่น",
//     firstname: "ณฐพล",
//     lastname: "ชั้นประดับ",
//     gender: "M",
//     email: "natapol.chanpradab@gmail.com",
//     facebook: "natapol",
//     telephone: "0925102223",
//     line: "0925102223",
//     birthdate: "1995-04-09T17:00:00.000Z",
//     address: null,
//     is_contactable_telephone: 1,
//     is_contactable_sms: 1,
//     occupation: "ลูกจ้าง",
//     is_active: 1,
//     is_delete: 0,
//     is_review: 1,
//     childrens: [
//         {
//             id: 2,
//             candidate_id: 5,
//             nickname: "ลูกเม่นไง",
//             firstname: "ก็ลูกเม่น",
//             lastname: "ลูกเม่นโว้ย",
//             gender: "M",
//             birthdate: "2024-12-30T17:00:00.000Z",
//             is_active: 1,
//             is_delete: 0
//         }
//     ],
//     candidateFormulas: [
//         {
//             id: 4,
//             candidate_id: 5,
//             formula_id: 2,
//             is_active: 1,
//             is_delete: 0,
//             formula: {
//                 id: 2,
//                 name: "Comfort Probio",
//                 brand_id: 2,
//                 is_active: 1,
//                 is_delete: 0,
//                 brand: {
//                     id: 2,
//                     name: "Hi-Q1",
//                     is_active: 1,
//                     is_delete: 0
//                 }
//             }
//         },
//         {
//             id: 5,
//             candidate_id: 5,
//             formula_id: 3,
//             is_active: 1,
//             is_delete: 0,
//             formula: {
//                 id: 3,
//                 name: "Test Formula",
//                 brand_id: 1,
//                 is_active: 1,
//                 is_delete: 0,
//                 brand: {
//                     id: 1,
//                     name: "S-26",
//                     is_active: 1,
//                     is_delete: 0
//                 }
//             }
//         }
//     ]
// },
// candidates: {
//     message: "",
//     statusCode: 0,
//     data: [
//         {
//             id: 5,
//             nickname: "เม่น",
//             firstname: "ณฐพล",
//             lastname: "ชั้นประดับ",
//             gender: "M",
//             email: "natapol.chanpradab@gmail.com",
//             facebook: "natapol",
//             telephone: "0925102223",
//             line: "0925102223",
//             birthdate: "1995-04-09T17:00:00.000Z",
//             address: null,
//             is_contactable_telephone: 1,
//             is_contactable_sms: 1,
//             occupation: "ลูกจ้าง",
//             is_active: 1,
//             is_delete: 0,
//             is_review: 1,
//             childrens: [
//                 {
//                     id: 2,
//                     candidate_id: 5,
//                     nickname: "ลูกเม่นไง",
//                     firstname: "ก็ลูกเม่น",
//                     lastname: "ลูกเม่นโว้ย",
//                     gender: "M",
//                     birthdate: "2024-12-30T17:00:00.000Z",
//                     is_active: 1,
//                     is_delete: 0,
//                 }
//             ],
//             candidateFormulas: [
//                 {
//                     id: 5,
//                     candidate_id: 5,
//                     formula_id: 3,
//                     is_active: 1,
//                     is_delete: 0,
//                     formula: {
//                         id: 3,
//                         name: "Test Formula",
//                         brand_id: 1,
//                         is_active: 1,
//                         is_delete: 0,
//                         brand: {
//                             id: 1,
//                             name: "S-26",
//                             is_active: 1,
//                             is_delete: 0,
//                         }
//                     }
//                 },
//                 {
//                     id: 4,
//                     candidate_id: 5,
//                     formula_id: 2,
//                     is_active: 1,
//                     is_delete: 0,
//                     formula: {
//                         id: 2,
//                         name: "Comfort Probio",
//                         brand_id: 2,
//                         is_active: 1,
//                         is_delete: 0,
//                         brand: {
//                             id: 2,
//                             name: "Hi-Q1",
//                             is_active: 1,
//                             is_delete: 0,
//                         }
//                     }
//                 }
//             ]
//         }
//     ],
//     total: 0,
//     page: "1",
//     limit: "10"
// }

export interface Brand {
	id: number
	name: string
	is_active: number
	is_delete: number
}

export interface Formula {
	id: number
	name: string
	brand_id: number
	is_active: number
	is_delete: number
	brand: Brand
	description?: string
}

export interface Child {
	id: number
	candidate_id: number
	nickname: string
	firstname: string
	lastname: string
	gender: string
	birthdate: string
	is_active: number
	is_delete: number
}

export interface CandidateFormula {
	id: number
	candidate_id: number
	formula_id: number
	is_active: number
	is_delete: number
	formula: Formula
}

export interface Candidate {
	id: number
	nickname: string
	firstname: string
	lastname: string
	gender: string
	email: string
	facebook: string
	telephone: string
	line: string
	birthdate: string
	address: string | null
	is_contactable_telephone: number
	is_contactable_sms: number
	occupation: string
	is_active: number
	is_delete: number
	is_review: number
	childrens: Child[]
	candidateFormulas: CandidateFormula[]
}

export interface CandidatesResponse {
	message: string
	statusCode: number
	data: Candidate[]
	total: number
	page: string
	limit: string
}
