<template>
	<div>
		<h1>Point Management : {{fullName}}</h1>
		<div class="mb-6 mt-4 flex justify-end">
			<!-- <n-input type="text" placeholder="Search Name , Telephone" size="large" :on-update:value="handleSearch" class="!w-[300px]">
				<template #suffix>
					<Icon icon="majesticons:search-line" style="color: #d1d1d1" width="24" />
				</template>
			</n-input> -->
			<n-button @click="handleOpenEditPoint" type="primary" size="large">
				<template #icon>
					<Icon icon="flowbite:edit-outline" />
				</template>
				Edit Point
			</n-button>
		</div>
		<n-data-table
			:row-key="rowKey"
			:columns="column"
			:data="candidateBAStore.point.data"
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
			<n-form>
				<n-grid :x-gap="12" cols="1 600:2" item-responsive>
					<n-gi>
						<n-form-item label="Mode" path="mode">
							<n-select
								:options="MODE_OPTIONS"
								v-model:value="dataPoint.mode"
								placeholder="Select Mode"
								size="large"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Point" path="mode">
							<n-input-number
								v-model:value="dataPoint.point"
								class="w-full"
								placeholder="Please Enter Point"
								size="large"
								:min="0"
							>
								<template #minus-icon>
									<Icon icon="bi:dash-circle" width="24" height="24" class="mr-1" />
								</template>
								<template #add-icon>
									<Icon icon="simple-line-icons:plus" width="24" height="24" class="ml-1" />
								</template>
							</n-input-number>
						</n-form-item>
					</n-gi>
					<n-gi span="1 600:2">
						<n-form-item label="Reason" path="reason">
							<n-input
								type="textarea"
								v-model:value="dataPoint.reason"
								placeholder="Please Enter Reason"
								size="large"
							/>
						</n-form-item>
					</n-gi>
				</n-grid>
			</n-form>
			<template #footer>
				<n-space justify="end">
					<n-button @click="handleCancelEditPoint" type="default" size="large">Cancel</n-button>
					<n-button @click="handleEditPoint" type="primary" size="large">Save</n-button>
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
	NGrid,
	NGi,
	NIcon,
	NDatePicker,
	NAvatar,
	NTreeSelect,
	useDialog,
	NInputNumber
} from "naive-ui"
import { Icon } from "@iconify/vue"

import type { DataTableColumns, DataTableRowKey } from "naive-ui"
import type { FormInst } from "naive-ui"

import { PAGE_SIZES, GENDER_OPTIONS, TELEPHONE_OPTIONS } from "@/components/utils/constants"
import { MODAL_TYPE } from "@/views/UserManagement/User/index.vue"
import { useCandidateBAStore } from "@/stores/useCandidateBAStore"
import _ from "lodash"
import { useRouter } from "vue-router"
import { renderMultipleSelectTag, renderLabel } from "@/components/common/SelectNaiveStyle"

interface RowData {
	id: number
	no: number
	transaction_type: string
	transaction_amount: number
	transaction_summary: string
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
		NTreeSelect,
		NInputNumber
	},
	setup() {
		const candidateBAStore = useCandidateBAStore()
		const paramId = ref<number>(0)
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
			brand_advocacy_id: router.currentRoute.value.params.id
		})
		const filterApi = reactive({
			name: ""
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
					return "Edit BA Point"
				default:
					return ""
			}
		})

		const defaultValue = {
			brand_advocacy_id: 0,
			mode: "add",
			point: 0,
			reason: ""
		}
		const REVIEW_OPTIONS = reactive({
			REVIEW_STATUS_OPTION: [{ value: 1, label: "" }]
		})
		const dataPoint = reactive({ ...defaultValue })
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
					title: "Transaction Type",
					key: "transaction_type",
					width: "300px",
					className: "whitespace-nowrap truncate"
				},
				{
					title: "Point",
					key: "transaction_amount",
					width: "250px",
					className: "whitespace-nowrap "
				},
				{
					title: "Summary",
					key: "transaction_summary",
					className: " whitespace-nowrap",
					width: "300px"
				}
			]
		}

		function handleCancelEditPoint(e: MouseEvent) {
			e.preventDefault()
			Object.assign(dataPoint, defaultValue)
			isModalManagement.value = false
		}

		onMounted(async () => {
			paramId.value = Number(router.currentRoute.value.params.id)
			const param = {
				page: 1,
				limit: 10,
				brand_advocacy_id: paramId.value
			}
			await candidateBAStore.getBaManageMent(param)
			await candidateBAStore.getCandidateById(paramId.value)
		})
		watch(pagination, async value => {
			/// Call API
			await candidateBAStore.getBaManageMent({ ...value })
		})
		// watch(filterApi, async value => {
		// 	pagination.page = 1
		// 	/// Call API
		// 	await candidateBAStore.getCandidates({ ...pagination, ...value })
		// })

		const handleSearch = _.debounce((value: string) => {
			filterApi.name = value
		}, 500)
		const paginateCount = computed(() => {
			const countPage = pagination.limit * pagination.page
			const totalTeams = candidateBAStore?.point?.total ?? 0
			return countPage > totalTeams ? totalTeams : countPage
		})
		const itemCount = computed(() => {
			return candidateBAStore?.point.total || 0
		})

		function handleEditPoint(e: MouseEvent) {
			e.preventDefault()

			const formateBody = {
				brand_advocacy_id: paramId.value,
				mode: dataPoint.mode,
				point: Number(dataPoint.point),
				reason: dataPoint.reason
			}
			dialog.warning({
				title: "ยืนยันการแก้ไขข้อมูล",
				content: ``,
				positiveText: "แน่ใจ",
				negativeText: "ยกเลิก",
				onPositiveClick: async () => {
					await candidateBAStore.updateBaManageMent(formateBody)
					await candidateBAStore.getBaManageMent({ ...pagination })
					isModalManagement.value = false
					Object.assign(dataPoint, defaultValue)
				}
			})
		}
		function handleOpenEditPoint() {
			isModalManagement.event = MODAL_TYPE.EDIT
			isModalManagement.value = true
		}
		function handleInput(event: Event) {
			const input = event.target as HTMLInputElement
			if (input.value.includes("-")) {
				input.value = input.value.replace(/-/g, "")
			}
			dataPoint.reason = input.value
		}
		const fullName = computed(() => {
			return `${candidateBAStore.candidate?.firstname} ${candidateBAStore.candidate?.lastname}`
		})
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
			MODAL_TYPE,
			dataPoint,
			renderMultipleSelectTag,
			renderLabel,
			handleEditPoint,
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
			handleOpenEditPoint,
			handleCancelEditPoint,
			teamOptions,
			TELEPHONE_OPTIONS,
			REVIEW_OPTIONS,
			MODE_OPTIONS: [
				{ label: "Add", value: "add" },
				{ label: "Subtract", value: "subtract" }
			],
			handleInput,
			fullName
		}
	}
})
</script>
<style>
.n-form-item.n-form-item--top-labelled .n-form-item-label {
	color: #5f6674;
}
</style>
