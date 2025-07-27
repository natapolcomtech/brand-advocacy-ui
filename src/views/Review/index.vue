<template>
	<div class="!bg-white p-4 rounded-lg">
		<div class="bg-[#FFD984] rounded-xl py-4 px-6 flex flex-col-reverse lg:flex-row lg:justify-between gap-x-6 overflow-x-auto">
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex md:inline-block justify-center items-center mb-4 md:mb-0">
					<n-avatar
						:size="130"
						:style="{
							backgroundColor: 'Azure'
						}"
					>
						<p class="text-3xl">
							{{ reviewDetail.firstname.charAt(0).toUpperCase() }}
						</p>
					</n-avatar>
				</div>
				<div class="flex flex-col gap-1">
					<h2 class="mb-4 text-2xl font-semibold text-[#2E3C52]">
						{{ `${reviewDetail.firstname}  ${reviewDetail.lastname}` }}
					</h2>
					<span class="md:flex">
						<p class="md:w-40 font-bold">Facebook</p>
						<p class="truncate">: {{ reviewDetail.facebook }}</p>
					</span>
					<span class="md:flex">
						<p class="md:w-40 font-bold">Line ID</p>
						<p class="truncate">: {{ reviewDetail.line }}</p>
					</span>
					<span class="md:flex">
						<p class="md:w-40 font-bold">Email</p>
						<p class="truncate">: {{ reviewDetail.email }}</p>
					</span>
					<span class="md:flex">
						<p class="md:w-40 font-bold">Phone</p>
						<p class="truncate">: {{ reviewDetail.telephone }}</p>
					</span>
					<n-space class="mt-4">
						<n-button
							:type="
								reviewDetail.is_contactable_telephone !== 0 && reviewDetail.is_contactable_telephone < 4
									? 'info'
									: 'error'
							"
							round
							size="small"
						>
							{{
								REVIEW_OPTIONS.TELEPHONE_OPTIONS.find(
									option => option.value === reviewDetail?.is_contactable_telephone
								)?.label
							}}
						</n-button>
						<n-button :type="reviewDetail.is_contactable_sms === 1 ? 'info' : 'error'" round size="small">
							{{
								`${reviewDetail.is_contactable_sms === 1 ? "Is SMS Contactable" : "Unable to contactable via SMS"}`
							}}
						</n-button>
					</n-space>
				</div>
			</div>
			<n-space class="!mt-4 !flex justify-end ml-auto lg:!inline-block md:mt-0 mb-4 gap-4 ">
				<n-select
					class="!w-[250px]"
					size="large"
					v-model:value="defaultValue.review_status_id"
					:render-label="renderLabel"
					:render-tag="renderMultipleSelectTag"
					:options="REVIEW_OPTIONS.REVIEW_STATUS_OPTION"
				/>
			</n-space>
		</div>
		<h4 class="my-8">แบบฟอร์มสำรวจข้อมูลการติดต่อผู้สมัคร</h4>
		<n-space >
			<n-space>
				<n-card
					@click="isModalManagement.event = MODAL_TYPE.CANDIDATE"
					:class="`cursor-pointer hover:!bg-[#FFF5F9] hover:!border-[#FF8995]  !rounded-lg ${isModalManagement.event === MODAL_TYPE.CANDIDATE ? '!bg-[#FFF5F9] !border-[#FF8995] ' : ''}`"
				>
					<div class="flex gap-4">
						<div>
							<img src="/images/icon/candidate.svg" alt="candidate-icon" />
						</div>
						<span>
							<h5>Candidate Information</h5>
							<p class="text-xs">ข้อมูลส่วนบุคคลของ Candidate</p>
						</span>
					</div>
				</n-card>
			</n-space>
			<n-space>
				<n-card
					@click="isModalManagement.event = MODAL_TYPE.FACEBOOK"
					:class="`cursor-pointer !rounded-lg hover:!bg-[#E0F2FE] hover:!border-[#247AEB]  ${isModalManagement.event === MODAL_TYPE.FACEBOOK ? '!bg-[#E0F2FE] !border-[#247AEB]' : ''}`"
				>
					<div class="flex gap-4">
						<div>
							<img src="/images/icon/facebook.svg" alt="facebook-icon" />
						</div>
						<span>
							<h5>Facebook</h5>
							<p class="text-xs">กรอกฟอร์มสำรวจ Facebook สำหรับคัดเลือก BA</p>
						</span>
					</div>
				</n-card>
			</n-space>
			<n-space>
				<n-card
					@click="isModalManagement.event = MODAL_TYPE.LINE"
					:class="`cursor-pointer !rounded-lg hover:!bg-[#D3F8DE] hover:!border-[#1C9E6A] ${isModalManagement.event === MODAL_TYPE.LINE ? '!bg-[#D3F8DE] !border-[#1C9E6A]' : ''}`"
				>
					<div class="flex gap-4">
						<div>
							<img src="/images/icon/line.svg" alt="line-icon" />
						</div>
						<span>
							<h5>Line</h5>
							<p class="text-xs">กรอกฟอร์มสำรวจ Line สำหรับคัดเลือก BA</p>
						</span>
					</div>
				</n-card>
			</n-space>
		</n-space>
		<!-- CANDIDATE CARD -->
		<n-card
			v-if="isModalManagement.event === MODAL_TYPE.CANDIDATE"
			size="medium"
			class="mt-4 !rounded-xl !border-[#D1D5DB]"
		>
			<n-space vertical>
				<h4 class="mb-2 font-semibold text-[#2073DE]">ข้อมูลแม่</h4>
				<div class="flex flex-col gap-1 pl-5">
					<span class="flex">
						<p class="md:w-40 font-bold">ชื่อ</p>
						<p class="truncate">{{ `: ${reviewDetail.firstname} ${reviewDetail.lastname}` }}</p>
					</span>
					<span class="flex">
						<p class="md:w-40 font-bold">ชื่อเล่น</p>
						<p class="truncate">{{ `: ${reviewDetail.nickname} ` }}</p>
					</span>
					<span class="flex">
						<p class="md:w-40 font-bold">อายุ</p>
						<p>{{ `: ${calculateAge(reviewDetail.birthdate)}` }}</p>
					</span>
					<span class="flex">
						<p class="md:w-40 font-bold">อาชีพ</p>
						<p>{{ `: ${reviewDetail.occupation}` }}</p>
					</span>
					<span class="flex">
						<p class="md:w-40 font-bold">ที่อยู่</p>
						<p>{{ `: ${reviewDetail.address ?? "-"}` }}</p>
					</span>
					<span class="flex">
						<p class="md:w-40 font-bold">บุตร</p>
						<p>{{ `: ${reviewDetail.childrens.length} คน` }}</p>
					</span>
				</div>
			</n-space>
			<n-space v-show="reviewDetail.childrens.length > 0" vertical class="mt-4">
				<h4 class="mb-2 font-semibold text-[#2073DE]">ข้อมูลลูก</h4>
				<div
					v-for="child in reviewDetail.childrens"
					:key="child.id"
					:class="`flex flex-col gap-1 pl-5  ${reviewDetail.childrens.length > 1 ? 'border-b  pb-2' : 'mb-2 '}`"
				>
					<span class="flex">
						<p class="md:w-40 font-bold">ชื่อ</p>
						<p class="truncate">{{ `: ${child.firstname} ${child.lastname}` }}</p>
					</span>
					<span class="flex">
						<p class="md:w-40 font-bold">เพศ</p>
						<p>{{ `: ${child.gender === "M" ? "ชาย" : "หญิง"}` }}</p>
					</span>
					<span class="flex">
						<p class="md:w-40 font-bold">อายุ</p>
						<p>{{ `: ${calculateAge(child.birthdate)}` }}</p>
					</span>
				</div>
			</n-space>
			<n-space vertical class="mt-4">
				<h4 class="mb-2 font-semibold text-[#2073DE]">ทีม :</h4>
				<span class="flex">
					<p class="flex flex-col gap-1 pl-5">{{ defaultValue.team_name }}</p>
				</span>
			</n-space>
			<n-space vertical class="mt-4">
				<h4 class="mb-2 font-semibold text-[#2073DE] truncate">ยี่ห้อผลิตภัณฑ์ (Product) :</h4>
				<div v-if="reviewDetail.candidateFormulas.length > 0">
					<span class="flex">
						<p
							v-for="(item, index) in reviewDetail.candidateFormulas"
							:key="index"
							class="flex flex-col gap-1 pl-5"
						>
							{{ getBrandName(item.formula_id) ?? "-" }}
						</p>
					</span>
				</div>
				<div v-else class="pl-5">-</div>
			</n-space>
			<n-space vertical class="mt-4">
				<h4 class="mb-2 font-semibold text-[#2073DE] truncate">สูตรนมผง (Formula) :</h4>
				<div v-if="reviewDetail.candidateFormulas.length > 0">
					<span v-for="(item, index) in reviewDetail.candidateFormulas" :key="index">
						<ul class="flex flex-col pl-5">
							<li>
								<p>{{ item.formula.name }}</p>
							</li>
							<p class="text-sm text-[#858C94]">{{ item.formula.description ?? "-" }}</p>
						</ul>
					</span>
				</div>
				<div v-else class="pl-5">-</div>
			</n-space>
		</n-card>
		<!-- FACEBOOK CARD -->
		<n-card
			v-if="isModalManagement.event === MODAL_TYPE.FACEBOOK"
			size="medium"
			class="mt-4 !rounded-xl !border-[#D1D5DB]"
		>
			<n-space vertical>
				<h4 class="mb-2 font-semibold text-[#2E3C52]">ข้อมูลการติดต่อผ่าน Facebook</h4>
				<n-space vertical class="pl-4">
					<h5 class="text-[#204486]">เปิดใช้งาน Facebook อายุมากกว่า 1 ปี :</h5>
					<n-checkbox-group v-model:value="defaultValue.facebook_age" name="radiogroup">
						<n-space vertical>
							<n-checkbox
								v-for="item in REVIEW_OPTIONS.FACEBOOK_AGE_OPTION"
								:key="item.value"
								:value="item.value"
								:label="item.label"
							/>
						</n-space>
					</n-checkbox-group>
					<h5 class="text-[#204486] mt-4">มีเพื่อนบน Facebook กว่า 100 คน :</h5>
					<n-checkbox-group v-model:value="defaultValue.facebook_trust" name="radiogroup">
						<n-space vertical>
							<n-checkbox
								v-for="item in REVIEW_OPTIONS.FACEBOOK_TRUST_OPTION"
								:key="item.value"
								:value="item.value"
								:label="item.label"
							/>
						</n-space>
					</n-checkbox-group>
					<h5 class="text-[#204486] mt-4">มี Facebook มากกว่า 1 Account :</h5>
					<n-checkbox-group v-model:value="defaultValue.facebook_response" name="radiogroup">
						<n-space vertical>
							<n-checkbox
								v-for="item in REVIEW_OPTIONS.FACEBOOK_RESPONSE_OPTION"
								:key="item.value"
								:value="item.value"
								:label="item.label"
							/>
						</n-space>
					</n-checkbox-group>
				</n-space>
			</n-space>
		</n-card>
		<!-- LINE CARD -->
		<n-card
			v-if="isModalManagement.event === MODAL_TYPE.LINE"
			size="medium"
			class="mt-4 !rounded-xl !border-[#D1D5DB]"
		>
			<n-space vertical class="pl-4">
				<h5 class="text-[#204486] mt-4">Member :</h5>
				<n-checkbox-group v-model:value="defaultValue.line_trust" name="checkboxgroup">
					<n-space vertical>
						<n-checkbox
							v-for="item in REVIEW_OPTIONS.LINE_MEMBER_OPTION"
							:key="item.value"
							:value="item.value"
							:label="item.label"
						/>
					</n-space>
				</n-checkbox-group>
			</n-space>
		</n-card>
		<n-space v-if="isModalManagement.event === MODAL_TYPE.FACEBOOK" vertical class="p-4">
			<label class="text-[#204486]" for="defaultValue.facebook_remark">หมายเหตุ :</label>
			<n-input
				type="textarea"
				v-model:value="defaultValue.facebook_remark"
				placeholder="หมายเหตุที่ต้องการระบุเกี่ยวกับ Candidate"
				size="large"
			></n-input>
		</n-space>
		<n-space v-else-if="isModalManagement.event === MODAL_TYPE.LINE" vertical class="p-4">
			<label class="text-[#204486]" for="defaultValue.facebook_remark">หมายเหตุ :</label>
			<n-input
				type="textarea"
				v-model:value="defaultValue.line_remark"
				placeholder="หมายเหตุที่ต้องการระบุเกี่ยวกับ Candidate"
				size="large"
			></n-input>
		</n-space>
		<n-button
			v-if="isModalManagement.event !== MODAL_TYPE.CANDIDATE"
			@click="submitReview"
			type="primary"
			size="large"
			class="!w-full !bg-[#29409D]"
		>
			Save
		</n-button>

		<!-- Modal Team -->
		<n-modal
			v-if="isModalManagement.special === true"
			v-model:show="isModalManagement.special"
			:bordered="false"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '800px'
			}"
			title="Add BA to the team"
		>
			<label for="defaultValue.team_id">Team</label>
			<n-select
				size="large"
				v-model:value="defaultValue.team_id"
				:render-label="renderLabel"
				:render-tag="renderMultipleSelectTag"
				:options="teamOptions"
				filterable
				multiple
				class="mt-2"
			/>
			<template #footer>
				<n-space justify="end">
					<n-button @click="isModalManagement.value = false" type="default" size="large">Cancel</n-button>
					<n-button @click="approveTeam" type="primary" size="large">Approve</n-button>
				</n-space>
			</template>
		</n-modal>

		<n-modal
			v-if="isModalManagement.team === true"
			v-model:show="isModalManagement.team"
			:bordered="false"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '600px'
			}"
			class="!rounded-3xl shadow-lg"
		>
			<div class="flex flex-col text-center justify-center items-center">
				<img src="/images/icon/check-icon.svg" alt="" />
				<h2>Successfully Review</h2>
			
					<p>This candidate already promote to brand advocacy.</p>
					<p class="text-blue-500 font-bold">
						If you want to edit futher more please use "BA" menu to proceed
					</p>
				
			</div>
			<template #footer>
				<n-space justify="center">
					<n-button @click="successReview" type="primary" size="large">ปิด</n-button>
				</n-space>
			</template>
		</n-modal>
	</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, reactive, h } from "vue"
import {
	NAvatar,
	NSpace,
	NButton,
	NCard,
	NRadio,
	NRadioGroup,
	NInput,
	NTag,
	NSelect,
	NModal,
	useDialog,
	NCheckboxGroup,
	NCheckbox
} from "naive-ui"

import { useMasterDataStore } from "@/stores/useMasterDataStore"
import { useCandidateBAStore } from "@/stores/useCandidateBAStore"
import { useTeamManagementStore } from "@/stores/useTeamManagementStore"
import { useSystemMasterData } from "@/stores/useSystemMasterData"
import { useRouter } from "vue-router"
import moment from "moment"
import { MODAL_TYPE } from "@/views/UserManagement/User/index.vue"
import { renderMultipleSelectTag, renderLabel } from "@/components/common/SelectNaiveStyle"

interface ReviewDetail {
	id: number
	firstname: string
	lastname: string
	facebook: string
	line: string
	email: string
	telephone: string
	is_contactable_telephone: number
	is_contactable_sms: number
	birthdate: string
	occupation: string
	address: string | null
	nickname: string
	childrens: any[]
	candidateFormulas: any[]
	brandAdvocacys?: any[]
}
export default defineComponent({
	name: "Report",
	components: {
		NAvatar,
		NSpace,
		NButton,
		NCard,
		NRadio,
		NRadioGroup,
		NInput,
		NSelect,
		NModal,
		NCheckboxGroup,
		NCheckbox
	},
	setup() {
		const systemMasterDataStore = useSystemMasterData()
		const masterDataStore = useMasterDataStore()
		const candidateBAStore = useCandidateBAStore()
		const teamManagementStore = useTeamManagementStore()
		const dialog = useDialog()
		const teamOptions = ref<any>([])
		const reviewDetail: ReviewDetail = candidateBAStore.candidate
		const reviewCheckboxDetail = candidateBAStore.review
		const router = useRouter()
		const brands = ref<any>([])
		const isModalManagement = reactive({
			value: false,
			event: MODAL_TYPE.CANDIDATE,
			special: false,
			team: false
		})
		const REVIEW_OPTIONS = reactive({
			FACEBOOK_AGE_OPTION: [{ value: 1, label: "" }],
			FACEBOOK_TRUST_OPTION: [{ value: 1, label: "" }],
			FACEBOOK_RESPONSE_OPTION: [{ value: 1, label: "" }],
			LINE_MEMBER_OPTION: [{ value: 1, label: "" }],
			// LINE_RESPONSE_OPTION: [{ value: 1, label: "" }],
			REVIEW_STATUS_OPTION: [{ value: 1, label: "" }],
			TELEPHONE_OPTIONS: [{ value: 1, label: "" }]
		})
		function getBrandName(formula_id: number) {
			const brand = brands.value.find((b: { id: number }) => b.id === formula_id)
			return brand ? brand.name : "Unknown Brand"
		}
		function calculateAge(birthdate: any) {
			const birthdateMoment = moment(birthdate)
			const today = moment()

			let years = today.diff(birthdateMoment, "years")
			birthdateMoment.add(years, "years")

			let months = today.diff(birthdateMoment, "months")
			birthdateMoment.add(months, "months")

			if (months >= 12) {
				years += 1
				months -= 12
			}

			return `${years} ปี ${months} เดือน`
		}
		const defaultValue = ref({
			candidate_id: reviewDetail.id,
			facebook_age: [] as number[],
			facebook_trust: [] as number[],
			facebook_response: [] as number[],
			facebook_remark: "",
			line_trust: [] as number[],
			line_response: [] as number[],
			line_remark: "",
			review_status_id: 1,
			team_id: [],
			team_name: ""
		})
		onMounted(async () => {
			await masterDataStore.getBrands()
			await candidateBAStore.getCandidateById(reviewDetail.id)
			const teamNames =
				reviewDetail.brandAdvocacys
					?.flatMap((ba: any) => ba.teamBrandAdvocacy.map((tb: any) => tb?.team?.name))
					.filter((name: string | undefined) => name)
					.join(", ") || ""
			defaultValue.value = {
				candidate_id: reviewDetail.id,
				facebook_age: reviewCheckboxDetail.facebook_age,
				facebook_trust: reviewCheckboxDetail.facebook_trust,
				facebook_response: reviewCheckboxDetail.facebook_response,
				facebook_remark: reviewCheckboxDetail.facebook_remark,
				line_trust: reviewCheckboxDetail.line_trust,
				line_response: reviewCheckboxDetail.line_response,
				line_remark: reviewCheckboxDetail.line_remark,
				review_status_id: reviewCheckboxDetail.review_status_id,
				team_id: reviewCheckboxDetail.team_id,
				team_name: teamNames
			}
			await teamManagementStore.getTeamAllEditBA()
			teamOptions.value = teamManagementStore.teamAllBA.data.map((team: { id: number; name: string }) => ({
				value: team.id,
				label: team.name
			}))
			brands.value = masterDataStore.brands
			await systemMasterDataStore.getMappingData("facebook_age_option")
			await systemMasterDataStore.getMappingData("facebook_trust_option")
			await systemMasterDataStore.getMappingData("facebook_response_option")
			await systemMasterDataStore.getMappingData("line_member_option")
			await systemMasterDataStore.getMappingData("line_response_option")
			await systemMasterDataStore.getMappingData("review_status_option")
			await systemMasterDataStore.getMappingData("telephone_options")
			Object.assign(
				REVIEW_OPTIONS.FACEBOOK_AGE_OPTION,
				systemMasterDataStore.mapSystemOptions.facebook_age_option
			)
			Object.assign(
				REVIEW_OPTIONS.FACEBOOK_TRUST_OPTION,
				systemMasterDataStore.mapSystemOptions.facebook_trust_option
			)
			Object.assign(
				REVIEW_OPTIONS.FACEBOOK_RESPONSE_OPTION,
				systemMasterDataStore.mapSystemOptions.facebook_response_option
			)
			Object.assign(REVIEW_OPTIONS.LINE_MEMBER_OPTION, systemMasterDataStore.mapSystemOptions.line_member_option)
			Object.assign(
				REVIEW_OPTIONS.REVIEW_STATUS_OPTION,
				systemMasterDataStore.mapSystemOptions.review_status_option
			)
			Object.assign(REVIEW_OPTIONS.TELEPHONE_OPTIONS, systemMasterDataStore.mapSystemOptions.telephone_options)
		})
		async function submitReview() {
			const data = {
				...defaultValue.value
			}
			if (data.review_status_id !== 1 && data.review_status_id !== 5) {
				isModalManagement.special = true
			} else if (data.review_status_id === 5) {
				dialog.warning({
					title: "ยืนยันการแก้ไขข้อมูล",
					content: `ข้อมูลของ ${reviewDetail.firstname} ${reviewDetail.lastname} หรือไม่ ผู้ใช้จะไม่อยู่ในระบบอีกอย่างน้อย 3 เดือน ?`,
					positiveText: "แน่ใจ",
					negativeText: "ยกเลิก",
					onPositiveClick: async () => {
						await candidateBAStore.updateCandidateReview(data)
						isModalManagement.value = false
						router.push("/ba")
					},
					onNegativeClick: () => {
						// message.error("Not Sure")
					}
				})
			} else {
				dialog.warning({
					title: "ยืนยันการแก้ไขข้อมูล",
					content: `ข้อมูลของ ${reviewDetail.firstname} ${reviewDetail.lastname} หรือไม่ ?`,
					positiveText: "บันทึก",
					negativeText: "ยกเลิก",
					onPositiveClick: async () => {
						await candidateBAStore.updateCandidateReview(data)
						isModalManagement.value = false
						router.push("/workspace")
					},
					onNegativeClick: () => {
						// message.error("Not Sure")
					}
				})
			}
		}
		async function approveTeam() {
			const data = {
				...defaultValue.value
			}
			await candidateBAStore.updateCandidateReview(data)
			isModalManagement.special = false
			isModalManagement.team = true
			setTimeout(() => {
				isModalManagement.team = false
				router.push("/ba")
			}, 3000)
		}
		function successReview() {
			isModalManagement.team = false
			router.push("/ba")
		}
		return {
			calculateAge,
			getBrandName,
			isModalManagement,
			MODAL_TYPE,
			value: ref(null),
			REVIEW_OPTIONS,
			defaultValue,
			reviewDetail,
			renderLabel,
			renderMultipleSelectTag,
			reviewCheckboxDetail,
			submitReview,
			teamOptions,
			approveTeam,
			successReview
		}
	}
})
</script>
