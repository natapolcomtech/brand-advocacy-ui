<template>
	<div>
		<h1>BA List</h1>
		<n-space class="mb-6 mt-4">
			<n-input type="text" placeholder="Search Name , Telephone" size="large" :on-update:value="handleSearch">
				<template #suffix>
					<Icon icon="majesticons:search-line" style="color: #d1d1d1" width="24" />
				</template>
			</n-input>
		</n-space>
		<n-data-table
			:row-key="rowKey"
			:columns="column"
			:data="candidateBAStore.candidates.data"
			@update:checked-row-keys="handleCheck"
			scroll-x-auto
		/>
		<n-pagination
			:item-count="itemCount"
			:page-sizes="PAGE_SIZES"
			show-size-picker
			v-model:page="pagination.page"
			v-model:page-size="pagination.limit"
			class="justify-center mt-4"
		>
			<template #prefix="{ itemCount, startIndex }">
				<div class="hidden md:block">({{ startIndex + 1 }} - {{ paginateCount }}) Of {{ itemCount }} items</div>
			</template>
		</n-pagination>

		<n-modal
			v-if="isModalManagement.event === MODAL_TYPE.VIEW"
			v-model:show="isModalManagement.value"
			:bordered="false"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '1000px'
			}"
			:title="titleModal"
		>
			<div class="bg-[#FFD984] rounded-xl py-4 px-6 md:flex gap-x-6">
				<div class="flex md:inline-block justify-center items-center mb-4 md:mb-0">
					<n-avatar
						:size="130"
						:style="{
							backgroundColor: 'Azure'
						}"
					>
						<p class="text-3xl">{{ candidateDetail.firstname[0].toUpperCase() }}</p>
					</n-avatar>
				</div>

				<div>
					<h2 class="mb-4 text-2xl font-semibold text-[#2E3C52]">
						{{ candidateDetail.firstname }} {{ candidateDetail.lastname }}
					</h2>
					<div class="flex flex-col gap-1">
						<span class="md:flex">
							<p class="md:w-40 font-bold">Facebook</p>
							<p class="truncate">: {{ candidateDetail.facebook }}</p>
						</span>
						<span class="md:flex">
							<p class="md:w-40 font-bold">Line ID</p>
							<p class="truncate">: {{ candidateDetail.line }}</p>
						</span>
						<span class="md:flex">
							<p class="md:w-40 font-bold">Email</p>
							<p class="truncate">: {{ candidateDetail.email }}</p>
						</span>
						<span class="md:flex">
							<p class="md:w-40 font-bold">Phone</p>
							<p class="truncate">: {{ candidateDetail.telephone }}</p>
						</span>
					</div>
					<n-space class="mt-4 overflow-x-auto">
						<n-button
							:type="
								candidateDetail.is_contactable_telephone !== 0 &&
								candidateDetail.is_contactable_telephone < 4
									? 'info'
									: 'error'
							"
							round
							size="small"
						>
							{{
								TELEPHONE_OPTIONS.find(
									option => option.value === candidateDetail?.is_contactable_telephone
								)?.label
							}}
						</n-button>
						<n-button
							:type="candidateDetail.is_contactable_sms === 1 ? 'info' : 'error'"
							round
							size="small"
						>
							{{
								`${candidateDetail.is_contactable_sms === 1 ? "Is SMS Contactable" : "Unable to contactable via SMS"}`
							}}
						</n-button>
					</n-space>
				</div>
				<div class="mt-4 flex justify-end w-full lg:-ml-20">
					<n-button
						@click="navigateToManagePoint(candidateDetail.brandAdvocacys[0]?.id)"
						size="small"
						type="info"
						round
						class="!flex !items-center !justify-center !text-center"
					>
						<p class="text-white mr-1">Point</p>
						{{ candidateDetail.brandAdvocacys[0]?.point }}
						<Icon icon="flowbite:edit-outline" width="16" height="16" style="color: #ffff" class="ml-1" />
					</n-button>
				</div>
			</div>
			<n-card size="medium" class="mt-4 !rounded-xl !border-[#D1D5DB]">
				<n-space vertical>
					<h4 class="mb-2 font-semibold text-[#2073DE]">ข้อมูลแม่</h4>
					<div class="flex flex-col gap-1 pl-5">
						<span class="flex">
							<p class="md:w-40 font-bold">ชื่อ</p>
							<p class="truncate">{{ `: ${candidateDetail.firstname} ${candidateDetail.lastname}` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">ชื่อเล่น</p>
							<p class="truncate">{{ `: ${candidateDetail.nickname} ` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">อายุ</p>
							<p>{{ `: ${calculateAge(candidateDetail.birthdate)}` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">อาชีพ</p>
							<p>{{ `: ${candidateDetail.occupation}` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">ที่อยู่</p>
							<p>{{ `: ${candidateDetail.address ?? "-"}` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">บุตร</p>
							<p>{{ `: ${candidateDetail.childrens.length} คน` }}</p>
						</span>
					</div>
				</n-space>
				<n-space v-show="candidateDetail.childrens.length > 0" vertical class="mt-4">
					<h4 class="mb-2 font-semibold text-[#2073DE]">ข้อมูลลูก</h4>
					<div
						v-for="child in candidateDetail.childrens"
						:key="child.id"
						:class="`flex flex-col gap-1 pl-5  ${candidateDetail.childrens.length > 1 ? 'border-b  pb-2' : 'mb-2 '}`"
					>
						<span class="flex">
							<p class="md:w-40 font-bold">ชื่อ</p>
							<p class="truncate">{{ `: ${child.firstname} ${child.lastname}` }}</p>
						</span>
						<span class="flex">
							<p class="md:w-40 font-bold">ชื่อเล่น</p>
							<p>{{ `: ${child.nickname}` }}</p>
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
						<p class="flex flex-col gap-1 pl-5">
							{{ candidateDetail.team ? candidateDetail.team : "-" }}
						</p>
					</span>
				</n-space>
				<n-space vertical class="mt-4">
					<h4 class="mb-2 font-semibold text-[#2073DE] truncate">ยี่ห้อผลิตภัณฑ์ (Product) :</h4>
					<div v-if="candidateDetail.candidateFormulas.length > 0">
						<span class="flex">
							<p
								v-for="(item, index) in candidateDetail.candidateFormulas"
								:key="index"
								class="flex flex-col gap-1 pl-5"
							>
								{{ item.formula?.brand?.name ?? "-" }}
							</p>
						</span>
					</div>
					<div v-else class="pl-5">-</div>
				</n-space>
				<n-space vertical class="mt-4">
					<h4 class="mb-2 font-semibold text-[#2073DE] truncate">สูตรนมผง (Formula) :</h4>
					<div v-if="candidateDetail.candidateFormulas.length > 0">
						<span v-for="(item, index) in candidateDetail.candidateFormulas" :key="index">
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
		</n-modal>

		<n-modal
			v-if="isModalManagement.event === MODAL_TYPE.EDIT"
			v-model:show="isModalManagement.value"
			:bordered="false"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '800px'
			}"
			:title="titleModal"
		>
			<n-form ref="formRefCandidate" :model="dataCandidate" :rules="rules">
				<h4 class="mb-4 font-medium text-[#2073DE]">ข้อมูลแม่</h4>
				<n-grid :x-gap="12" cols="1 600:2" item-responsive>
					<n-gi>
						<n-form-item label="First Name" path="firstname">
							<n-input
								type="text"
								v-model:value="dataCandidate.firstname"
								placeholder="Enter First Name"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Last Name" path="lastname">
							<n-input
								type="text"
								v-model:value="dataCandidate.lastname"
								placeholder="Enter Last Name"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Nickname" path="nickname">
							<n-input
								type="text"
								v-model:value="dataCandidate.nickname"
								placeholder="Enter Nickname"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Birth date" path="birthdate">
							<n-date-picker
								size="large"
								v-model:value="dataCandidate.birthdate"
								type="date"
								class="w-full"
								format="dd/MM/yyyy"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Team" path="team">
							<n-select
								size="large"
								v-model:value="dataCandidate.team_id"
								:render-label="renderLabel"
								:render-tag="renderMultipleSelectTag"
								:options="teamOptions"
								multiple
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Review Status" path="review_status_id">
							<n-select
								size="large"
								v-model:value="dataCandidate.review_status_id"
								:render-label="renderLabel"
								:render-tag="renderMultipleSelectTag"
								:options="REVIEW_OPTIONS.REVIEW_STATUS_OPTION"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Gender" path="gender">
							<n-select
								size="large"
								v-model:value="dataCandidate.gender"
								:render-label="renderLabel"
								:render-tag="renderMultipleSelectTag"
								:options="GENDER_OPTIONS"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Career" path="occupation">
							<n-input
								type="text"
								v-model:value="dataCandidate.occupation"
								placeholder="Enter Career"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Facebook" path="facebook">
							<n-input
								type="text"
								v-model:value="dataCandidate.facebook"
								placeholder="Enter Facebook"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Line" path="line">
							<n-input
								type="text"
								v-model:value="dataCandidate.line"
								placeholder="Enter Line"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Email" path="email">
							<n-input
								type="text"
								v-model:value="dataCandidate.email"
								placeholder="Enter Email"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Telephone" path="telephone">
							<n-input
								type="text"
								v-model:value="dataCandidate.telephone"
								placeholder="Enter Telephone"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Is Telephone Contactable" path="is_contactable_telephone">
							<n-select
								:options="TELEPHONE_OPTIONS"
								v-model:value="dataCandidate.is_contactable_telephone"
								:render-label="renderLabel"
								:render-tag="renderMultipleSelectTag"
								class="!w-full"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Is SMS Contactable" path="is_contactable_sms">
							<n-select
								:options="MOCK_OPTIONS_SMS"
								:render-label="renderLabel"
								:render-tag="renderMultipleSelectTag"
								v-model:value="dataCandidate.is_contactable_sms"
								class="!w-full"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi span="2">
						<n-form-item label="Address" path="address">
							<n-input
								type="textarea"
								v-model:value="dataCandidate.address"
								placeholder="Enter Address"
								size="large"
							/>
						</n-form-item>
					</n-gi>
				</n-grid>
			</n-form>
			<!-- Add Child -->
			<n-card
				v-for="(child, index) in dataCandidate.childrens.filter(child => child.is_delete !== 1)"
				:key="index"
				class="!rounded-xl !border-[#DADADA] mt-2"
			>
				<header class="md:flex md:justify-between mb-6">
					<div class="flex gap-x-2 md:justify-center items-center">
						<Icon icon="mingcute:user-4-fill" width="20" height="20" style="color: #2073de" />
						<h4 class="text-[#2073DE]">ข้อมูลบุตรคนที่ {{ index + 1 }}</h4>
					</div>

					<div class="flex justify-end my-2 md:my-0">
						<n-button class="" size="small" ghost color="#fe4c4c" @click="removeChild(index, child)">
							<template #icon>
								<n-icon>
									<Icon icon="tabler:trash" width="16" height="16" style="color: #fe4c4c" />
								</n-icon>
							</template>
							Delete
						</n-button>
					</div>
				</header>

				<!-- @vue-ignore -->
				<n-form :ref="el => (formRefChild[index] = el)" :model="child" :rules="childRules">
					<n-grid :x-gap="12" cols="1 400:4 500:5" item-responsive>
						<n-gi span="2">
							<n-form-item label="First Name" path="firstname">
								<n-input
									type="text"
									v-model:value="child.firstname"
									placeholder="Enter First Name"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Last Name" path="lastname">
								<n-input
									type="text"
									v-model:value="child.lastname"
									placeholder="Enter Last Name"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 400:2 500:1">
							<n-form-item label="Nickname" path="nickname">
								<n-input
									type="text"
									v-model:value="child.nickname"
									placeholder="Enter Nickname"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Gender" path="gender">
								<n-select
									size="large"
									v-model:value="child.gender"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="GENDER_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3 400:4 500:3">
							<n-form-item label="Birth date" path="birthdate">
								<n-date-picker
									size="large"
									v-model:value="child.birthdate"
									type="date"
									class="w-full"
									format="dd/MM/yyyy"
								/>
							</n-form-item>
						</n-gi>
					</n-grid>
				</n-form>
			</n-card>
			<n-button type="info" class="!w-full !mt-4 !mb-2" @click="addChild">
				<n-icon class="mr-2">
					<Icon icon="icons8:plus" width="20" height="20" style="color: #ffff" />
				</n-icon>
				Add Child
			</n-button>
			<!-- Add Formula -->
			<n-card
				v-for="(item, index) in dataCandidate.candidateFormulas.filter(
					formula => formula.formula.is_delete !== 1
				)"
				:key="index"
				class="!rounded-xl !border-[#DADADA] mt-2"
			>
				<header class="md:flex md:justify-between mb-6">
					<h4 class="text-[#2073DE]">Product Formula</h4>

					<div class="flex justify-end my-2 md:my-0">
						<n-button
							class="md:flex md:justify-between"
							size="small"
							ghost
							color="#fe4c4c"
							@click="removeProduct(index, item)"
						>
							<template #icon>
								<n-icon>
									<Icon icon="tabler:trash" width="16" height="16" style="color: #fe4c4c" />
								</n-icon>
							</template>
							Delete
						</n-button>
					</div>
				</header>
				<!-- @vue-ignore -->
				<n-form :ref="el => (formRefProduct[index] = el)" :model="item.formula" :rules="productRules">
					<n-grid :x-gap="12" cols="1 400:2 600:2" item-responsive>
						<n-gi>
							<n-form-item label="Product Name" path="id">
								<n-tree-select
									block-line
									:options="productOption"
									size="large"
									v-model:value="item.formula.id"
									:override-default-node-click-behavior="override"
									default-expand-all
									show-path
									@update:value="(value, option) => handleUpdateFormula(value, option, index)"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3 600:1">
							<n-form-item label="Formula Description" path="description">
								<n-input
									size="large"
									v-model:value="item.formula.description"
									placeholder="Pleas Enter Description"
									disabled
								/>
							</n-form-item>
						</n-gi>
					</n-grid>
				</n-form>
			</n-card>
			<n-button type="info" class="!w-full !mt-4" @click="addProduct">
				<n-icon class="mr-2">
					<Icon icon="icons8:plus" width="20" height="20" style="color: #ffff" />
				</n-icon>
				Add Product Formula
			</n-button>
			<template #footer>
				<n-space justify="end">
					<n-button @click="handleCancelCandidateBA" type="default" size="large">Cancel</n-button>
					<n-button @click="handleEditBA" type="primary" size="large">Save</n-button>
				</n-space>
			</template>
		</n-modal>
	</div>
</template>

<script lang="ts">
import { defineComponent, h, ref, computed, reactive, onMounted, watch } from "vue"
import {
	NDataTable,
	NModal,
	NPagination,
	NInput,
	NSpace,
	NButton,
	NCard,
	NForm,
	NFormItem,
	NSelect,
	NTag,
	NGrid,
	NGi,
	NIcon,
	NDatePicker,
	NAvatar,
	NTreeSelect,
	useDialog
} from "naive-ui"
import { Icon } from "@iconify/vue"
import moment from "moment"

import type { DataTableColumns, DataTableRowKey, TreeSelectOverrideNodeClickBehavior } from "naive-ui"
import type { FormInst, FormRules } from "naive-ui"

import { PAGE_SIZES, GENDER_OPTIONS, TELEPHONE_OPTIONS } from "@/components/utils/constants"
import { MODAL_TYPE } from "@/views/UserManagement/User/index.vue"
import { useMasterDataStore } from "@/stores/useMasterDataStore"
import { useCandidateBAStore } from "@/stores/useCandidateBAStore"
import { useTeamManagementStore } from "@/stores/useTeamManagementStore"
import _ from "lodash"
import { useRouter } from "vue-router"
import { renderMultipleSelectTag, renderLabel } from "@/components/common/SelectNaiveStyle"
import { useSystemMasterData } from "@/stores/useSystemMasterData"

interface Team {
	id: number
	name: string
	is_active: number
	is_delete: number
}
interface TeamBrandAdvocacy {
	id: number
	team_id: number | null
	brand_advocacy_id: number
	team: Team
}

interface BrandAdvocacy {
	id: number | null
	candidate_id: number
	candidate_review_id: number
	point: number
	buzzebees_ref_id: number
	is_active: number
	is_delete: number
	is_review: number
	teamBrandAdvocacy: TeamBrandAdvocacy[]
}

interface RowData {
	id: number
	key?: number
	firstname: string
	lastname: string
	email: string
	birthdate?: string
	brand: { name1: string; name2: string }
	brandAdvocacys: BrandAdvocacy[]
	childrens: {
		id: number
		firstname: string
		lastname: string
		gender: string | null
		is_active: number
		is_delete: number
	}[]
	candidateFormulas?: { id: number; formula: { brand: { name: string } } }[]
	candidateReviews?: { id: number; review_status_id: number }[]
}

export default defineComponent({
	name: "Candidate",
	components: {
		NDataTable,
		NModal,
		NPagination,
		NInput,
		NSpace,
		NButton,
		NCard,
		NForm,
		NFormItem,
		NSelect,
		NIcon,
		NGrid,
		NGi,
		NDatePicker,
		NAvatar,
		Icon,
		NTreeSelect
	},
	setup() {
		const teamManagementStore = useTeamManagementStore()
		const masterDataStore = useMasterDataStore()
		const candidateBAStore = useCandidateBAStore()
		const systemMasterDataStore = useSystemMasterData()
		const teamOptions = ref<any>([])
		const dialog = useDialog()
		const router = useRouter()
		const brands = ref<any>([])
		const brandOption = computed(() =>
			brands.value.map((brand: any) => ({
				label: brand.name,
				value: brand.id
			}))
		)
		const productOption = ref<any>([])
		const showModalRef = ref(false)
		const checkedRowKeysRef = ref<DataTableRowKey[]>([])
		const formRefCandidate = ref<FormInst | null>(null)
		const formRefChild = ref<(FormInst | null)[]>([])
		const formRefProduct = ref<(FormInst | null)[]>([])
		const pagination = reactive({
			page: 1,
			limit: 10,
			is_ba: 1
		})
		const filterApi = reactive({
			name: ""
		})
		const candidateDetail = reactive({
			id: 0,
			facebook: "",
			line: "",
			telephone: "",
			email: "",
			firstname: "",
			lastname: "",
			nickname: "",
			birthdate: "",
			is_contactable_telephone: 1,
			is_contactable_sms: 1,
			childrens: [
				{
					id: 0,
					nickname: "",
					firstname: "",
					lastname: "",
					gender: "",
					birthdate: null
				}
			],
			candidateFormulas: [
				{
					formula_id: 0,
					formula: {
						name: null,
						description: null,
						brand: { name: null }
					}
				}
			],
			team: "",
			occupation: "",
			address: "",
			brandAdvocacys: [
				{
					point: 0,
					id: 0
				}
			]
		})
		const isModalManagement = reactive({
			value: false,
			event: MODAL_TYPE.VIEW
		})
		const titleModal = computed(() => {
			switch (isModalManagement.event) {
				case MODAL_TYPE.VIEW:
					return "Information"
				case MODAL_TYPE.EDIT:
					return "Edit Information BA"
				default:
					return ""
			}
		})

		const defaultValue = {
			id: 0,
			firstname: "",
			lastname: "",
			nickname: "",
			birthdate: null,
			gender: "",
			occupation: "",
			email: "",
			line: "",
			address: "",
			telephone: "",
			facebook: "",
			is_contactable_telephone: "",
			is_contactable_sms: "",
			childrens: [
				{
					id: 0,
					nickname: "",
					firstname: "",
					lastname: "",
					birthdate: null,
					gender: null,
					is_active: 1,
					is_delete: 0
				}
			],
			candidateFormulas: [
				{
					formula: {
						id: null,
						brand: { name: null },
						name: null,
						description: null,
						is_delete: 0,
						is_active: 1
					}
				}
			],
			teams: [
				{
					team_id: 0,
					is_active: 1,
					is_delete: 0
				}
			],
			team_id: [],
			review_status_id: 0
		}
		const REVIEW_OPTIONS = reactive({
			REVIEW_STATUS_OPTION: [{ value: 1, label: "" }]
		})
		const dataCandidate = reactive({ ...defaultValue })
		const column = createColumns()

		function createColumns(): DataTableColumns<RowData> {
			return [
				{
					title: "No.",
					key: "no",
					className: "whitespace-nowrap",
					width: "50px",
					render(row, index) {
						return h("div", pagination.limit * (pagination.page - 1) + index + 1)
					}
				},
				{
					title: "BA",
					key: "bA",
					width: "300px",
					className: "whitespace-nowrap truncate",
					render(row) {
						return h("div", { className: "flex gap-2 truncate" }, [
							h(
								NAvatar,
								{
									style: {
										color: "white",
										backgroundColor: "skyblue",
										borderRadius: "100%"
									}
								},
								row.firstname.length > 0 ? row.firstname[0].toUpperCase() : ""
							),
							h("div", [
								h("div", `${row.firstname}  ${row.lastname}`),
								h("div", { className: "!text-xs mt-1" }, row.email)
							])
						])
					}
				},
				{
					title: "Team",
					key: "team",
					width: "250px",
					className: "whitespace-nowrap ",
					render(row: RowData) {
						const teamNames = Array.from(
							new Set(
								row.brandAdvocacys
									?.flatMap((ba: any) => ba.teamBrandAdvocacy.map((tb: any) => tb?.team?.name))
									.filter((name: string | undefined) => name)
							)
						).join(", ")
						return h("div", { class: "w-[250px] truncate" }, teamNames || "-")
					}
				},
				{
					title: "Child Information",
					key: "childInformation",
					className: "!text-center whitespace-nowrap",
					width: "300px",
					render(row) {
						return h("div", [h("div", {}, row.childrens.length + " คน")])
					}
				},
				{
					title: "Name",
					key: "status",
					width: "400px",
					render(row) {
						return h("div", { className: "flex gap-2 truncate" }, [
							h(
								NAvatar,
								{
									style: {
										color: "white",
										backgroundColor: "Crimson",
										borderRadius: "100%"
									}
								},
								row.firstname.length > 0 ? row.firstname[0].toUpperCase() : ""
							),
							h("div", [
								h("div", `${row.firstname}  ${row.lastname}`),
								h("div", { className: "!text-xs mt-1" }, row.email)
							])
						])
					}
				},
				{
					title: "Point",
					key: "point",
					width: "100px",
					render(row) {
						return h(
							NTag,
							{
								class: `whitespace-nowrap truncate !text-blue-500`,
								size: "medium",
								round: true,
								type: "info"
							},
							row.brandAdvocacys[0]?.point
						)
					}
				},
				{
					title: "Action",
					key: "action",
					className: "!text-center",
					width: "200px",
					render(row) {
						return h("div", { class: "flex gap-x-6 justify-center" }, [
							h(Icon, {
								icon: "mdi:eye-outline",
								class: "w-6 h-6 cursor-pointer",
								onClick: async () => {
									await candidateBAStore.getCandidateById(row.id)
									const teamNames = Array.from(
										new Set(
											row.brandAdvocacys
												?.flatMap((ba: any) =>
													ba.teamBrandAdvocacy.map((tb: any) => tb?.team?.name)
												)
												.filter((name: string | undefined) => name)
										)
									).join(", ")

									Object.assign(candidateDetail, candidateBAStore.candidate, { team: teamNames })
									console.log(candidateDetail)
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.VIEW
								}
							}),
							h(Icon, {
								icon: "flowbite:edit-outline",
								class: "w-6 h-6 cursor-pointer",
								onClick: async () => {
									await candidateBAStore.getCandidateById(row.id)
									Object.assign(dataCandidate, candidateBAStore.candidate, {
										teams: row.brandAdvocacys
											.flatMap((ba: BrandAdvocacy) =>
												ba.teamBrandAdvocacy.map((tb: TeamBrandAdvocacy) => ({
													team_id: tb.team?.id || null,
													is_active: tb.team?.is_active,
													is_delete: tb.team?.is_delete
												}))
											)
											.filter((team: any) => team.team_id !== null),
										birthdate: candidateBAStore.candidate.birthdate
											? moment(candidateBAStore.candidate.birthdate).valueOf()
											: null,
										team_id: row.brandAdvocacys
											.flatMap((ba: any) => ba.teamBrandAdvocacy.map((tb: any) => tb?.team?.id))
											.filter((id: any) => id !== null && id !== undefined),
										review_status_id:
											candidateBAStore.candidate?.brandAdvocacys[0].review_status_id,
										candidateFormulas: candidateBAStore.candidate.candidateFormulas.map(
											(cf: any) => ({
												...cf,
												formula: {
													...cf.formula,
													id: `_${cf.formula.id}`
												}
											})
										)
									})
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.EDIT
								}
							})
						])
					}
				}
			]
		}

		function handleCancelCandidateBA(e: MouseEvent) {
			e.preventDefault()
			Object.assign(dataCandidate, defaultValue)
			isModalManagement.value = false
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

		function getBrandName(formula_id: number) {
			const brand = brands.value.find((b: { id: number }) => b.id === formula_id)
			return brand ? brand.name : "Unknown Brand"
		}

		const override: TreeSelectOverrideNodeClickBehavior = ({ option }) => {
			if (option.children) {
				return "toggleExpand"
			}
			return "default"
		}
		onMounted(async () => {
			await candidateBAStore.getCandidates({ ...pagination, ...filterApi })
			await masterDataStore.getBrands()
			brands.value = masterDataStore.brands

			await teamManagementStore.getTeamAllEditBA()
			teamOptions.value = teamManagementStore.teamAllBA.data.map(
				(team: { id: number; name: string; is_active: number; is_delete: number }) => ({
					value: team.id,
					label: team.name,
					is_active: team.is_active,
					is_delete: team.is_delete
				})
			)
			await systemMasterDataStore.getMappingData("review_status_option")
			Object.assign(
				REVIEW_OPTIONS.REVIEW_STATUS_OPTION,
				systemMasterDataStore.mapSystemOptions.review_status_option
			)
			productOption.value = brands.value.map((brand: any) => ({
				label: brand.name,
				key: brand.id,
				children: brand.formulas.map((formula: any) => ({
					label: formula.name,
					key: `_${formula.id}`,
					description: formula.description
				}))
			}))
		})
		watch(pagination, async value => {
			/// Call API
			await candidateBAStore.getCandidates({ ...value, ...filterApi })
		})
		watch(filterApi, async value => {
			pagination.page = 1
			/// Call API
			await candidateBAStore.getCandidates({ ...pagination, ...value })
		})
		watch(
			() => dataCandidate.team_id,
			(newTeamIds: number[], oldTeamIds: number[]) => {
				// Find removed teams
				const removedTeams = oldTeamIds.filter((id: number) => !newTeamIds.includes(id))
				// Find added teams
				const addedTeams = newTeamIds.filter((id: number) => !oldTeamIds.includes(id))

				// Update dataCandidate.teams
				dataCandidate.teams = dataCandidate.teams.map(team => {
					if (team.team_id !== null && removedTeams.includes(team.team_id)) {
						return {
							...team,
							is_active: 0,
							is_delete: 1
						}
					}
					return team
				})

				// Add new teams
				addedTeams.forEach(id => {
					const existingTeam = dataCandidate.teams.find(team => team.team_id === id)
					if (!existingTeam) {
						dataCandidate.teams.push({
							team_id: id,
							is_active: 1,
							is_delete: 0
						})
					}
				})
			}
		)

		const handleSearch = _.debounce((value: string) => {
			filterApi.name = value
		}, 500)
		const paginateCount = computed(() => {
			const countPage = pagination.limit * pagination.page
			const totalTeams = candidateBAStore?.candidates?.total ?? 0
			return countPage > totalTeams ? totalTeams : countPage
		})
		const itemCount = computed(() => {
			return candidateBAStore?.candidates?.total || 0
		})
		function addChild() {
			const newChild = {
				id: 0,
				nickname: "",
				firstname: "",
				lastname: "",
				gender: null,
				birthdate: null,
				is_active: 1,
				is_delete: 0
			}
			dataCandidate.childrens.push(newChild)
		}

		function addProduct() {
			const newProduct = {
				formula: {
					id: null,
					id_index: 0,
					name: null,
					description: null,
					brand: { id: null, name: null },
					is_active: 1,
					is_delete: 0
				}
			}
			dataCandidate.candidateFormulas.push(newProduct)
		}

		function removeChild(index: number, child: any) {
			if (child.id !== dataCandidate.childrens[index].id) {
				dataCandidate.childrens.splice(index, 1)
			} else {
				dataCandidate.childrens[index].is_delete = 1
				dataCandidate.childrens[index].is_active = 0
			}
		}

		function removeProduct(index: number, item: any) {
			if (item.formula.id_index !== undefined) {
				dataCandidate.candidateFormulas.splice(index, 1)
			} else {
				dataCandidate.candidateFormulas[index].formula.is_delete = 1
				dataCandidate.candidateFormulas[index].formula.is_active = 0
			}
		}
		function handleEditBA(e: MouseEvent) {
			e.preventDefault()

			Promise.all([
				formRefCandidate.value?.validate(),
				...formRefChild.value.map(form => form?.validate()),
				...formRefProduct.value.map(form => form?.validate())
			])
				.then(() => {
					const formateBody = {
						id: dataCandidate.id,
						nickname: dataCandidate.nickname,
						firstname: dataCandidate.firstname,
						lastname: dataCandidate.lastname,
						gender: dataCandidate.gender,
						email: dataCandidate.email,
						facebook: dataCandidate.facebook,
						telephone: dataCandidate.telephone,
						line: dataCandidate.line,
						is_contactable_telephone: dataCandidate.is_contactable_telephone,
						is_contactable_sms: dataCandidate.is_contactable_sms,
						occupation: dataCandidate.occupation,
						address: dataCandidate.address,
						birthdate: moment(dataCandidate.birthdate).format("YYYY-MM-DD"),
						childs: dataCandidate.childrens.map((child: any) => ({
							id: child.id,
							nickname: child.nickname,
							firstname: child.firstname,
							lastname: child.lastname,
							gender: child.gender,
							birthdate: moment(child.birthdate).format("YYYY-MM-DD"),
							is_active: child.is_active,
							is_delete: child.is_delete
						})),
						formulas: dataCandidate.candidateFormulas.map((formula: any) => {
							const brandId = String(formula.formula.id)
							const formulaIdParts = brandId.split("_")
							return {
								formula_id: Number(formulaIdParts[1]),
								is_active: Number(formula.formula.is_active),
								is_delete: Number(formula.formula.is_delete)
							}
						}),
						teams: dataCandidate.teams.map((team: any) => ({
							team_id: team.team_id,
							is_active: team.is_active,
							is_delete: team.is_delete
						})),
						review_status_id: dataCandidate.review_status_id
					}
					dialog.warning({
						title: "ยืนยันการแก้ไขข้อมูล",
						content: `ข้อมูลของผู้ใช้ ${dataCandidate.firstname} ${dataCandidate.lastname} หรือไม่ ?`,
						positiveText: "แน่ใจ",
						negativeText: "ยกเลิก",
						onPositiveClick: async () => {
							pagination.page = 1
							await candidateBAStore.updateCandidate(formateBody)
							await candidateBAStore.getCandidates({ ...pagination, ...filterApi })
							isModalManagement.value = false
							Object.assign(dataCandidate, defaultValue)
						}
					})
				})
				.catch(errors => {
					console.error("Validation failed", errors)
				})
		}
		const handleUpdateFormula = (value: any, option: any, index: number) => {
			const formulas = {
				formula: {
					id: option.key,
					brand: { id: option.key, name: null },
					name: null,
					description: option.description,
					is_delete: 0,
					is_active: 1
				}
			}
			dataCandidate.candidateFormulas[index] = formulas
		}
		function reviewAll() {
			router.push("/workspace")
		}
		const childRules: FormRules = {
			firstname: {
				required: true,
				message: "Please input First Name",
				trigger: ["blur", "input"]
			},
			lastname: {
				required: true,
				message: "Please input Last Name",
				trigger: ["blur", "input"]
			},
			nickname: {
				required: true,
				message: "Please input Nickname",
				trigger: ["blur", "input"]
			},
			gender: {
				required: true,
				message: "Please select Gender",
				trigger: ["change"]
			},
			birthdate: {
				type: "date",
				required: true,
				message: "Please select Birth date",
				trigger: ["change"]
			}
		}
		const productRules: FormRules = {
			id: {
				required: true,
				message: "Please select Product Name",
				trigger: ["change"]
			}
		}
		const rules: FormRules = {
			firstname: {
				required: true,
				message: "Please input First Name",
				trigger: ["blur", "input"]
			},
			lastname: {
				required: true,
				message: "Please input Last Name",
				trigger: ["blur", "input"]
			},
			nickname: {
				required: true,
				message: "Please input Nickname",
				trigger: ["blur", "input"]
			},
			gender: {
				required: true,
				message: "Please select Gender",
				trigger: ["change"]
			},
			birthdate: {
				required: true,
				validator: value => {
					return value !== null && value !== undefined
				},
				message: "Please select Birth date",
				trigger: ["change"]
			},
			career: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please input career"
			},
			email: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please input email"
			},
			telephone: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please input telephone"
			},
			is_contactable_telephone: {
				required: true,
				trigger: ["change"],
				validator: value => {
					return value !== undefined && value !== null
				},
				message: "Please select is contactable telephone"
			},
			is_contactable_sms: {
				required: true,
				trigger: ["change"],
				validator: value => {
					return value !== undefined && value !== null
				},
				message: "Please select is contactable sms"
			},
			address: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please input address"
			},
			facebook: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please input facebook"
			},
			line: {
				required: true,
				trigger: ["blur", "change"],
				message: "Please input line"
			}
		}
		async function navigateToManagePoint(id:number) {
			router.push(`/ba/point/${id}`)
		}
		return {
			showModalRef,
			checkedRowKeysRef,
			rowKey: (row: RowData) => row.id,
			handleCheck(rowKeys: DataTableRowKey[]) {
				checkedRowKeysRef.value = rowKeys
			},
			column,
			PAGE_SIZES,
			isModalManagement,
			pagination,
			titleModal,
			formRefCandidate,
			formRefChild,
			formRefProduct,
			rules,
			MODAL_TYPE,
			dataCandidate,
			renderMultipleSelectTag,
			renderLabel,
			calculateAge,
			getBrandName,
			addChild,
			removeChild,
			addProduct,
			removeProduct,
			childRules,
			GENDER_OPTIONS,
			brands,
			candidateBAStore,
			paginateCount,
			itemCount,
			brandOption,
			productOption,
			MOCK_OPTIONS_SMS: [
				{ label: "IS SMS Contactable", value: 1 },
				{ label: "Unable to contactable via SMS", value: 0 }
			],
			handleSearch,
			candidateDetail,
			productRules,
			reviewAll,
			handleEditBA,
			handleCancelCandidateBA,
			override,
			teamOptions,
			TELEPHONE_OPTIONS,
			handleUpdateFormula,
			REVIEW_OPTIONS,
			navigateToManagePoint
		}
	}
})
</script>
<style>
.n-form-item.n-form-item--top-labelled .n-form-item-label {
	color: #5f6674;
}
</style>
