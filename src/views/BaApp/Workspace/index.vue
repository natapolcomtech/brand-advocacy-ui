<template>
	<div>
		<h1>Workspace</h1>
		<n-space class="mb-6 mt-4">
			<n-input :on-update:value="handleSearch" type="text" placeholder="Search" size="large">
				<template #suffix>
					<Icon icon="majesticons:search-line" style="color: #d1d1d1" width="24" />
				</template>
			</n-input>
		</n-space>
		<div class="rounded-t-xl bg-[#EAF4FF] w-full py-4 pl-12 pr-6 md:flex justify-between">
			<span class="flex items-center font-semibold truncate">
				<p class="text-[#2B405B]">รายการ BA ที่เลือก</p>
				<p class="text-[#4285F4] ml-2">{{ checkedRowKeysRef.length }} รายการ</p>
			</span>
			<span v-if="hasReviewing" class="flex items-center gap-2 font-semibold truncate">
				<p class="text-red-500 flex items-center font-semibold truncate">มี BA จำนวน</p>
				<p class="text-red-500 flex items-center font-semibold truncate">{{ reviewCount }}</p>
				<p class="text-red-500 flex items-center font-semibold truncate">ที่มีสถานะ Reviewing</p>
			</span>

			<n-space class="flex mt-2 md:mt-0 !justify-end md:block">
				<n-button
					@click="initialReview"
					:type="checkedRowKeysRef.length > 0 ? 'primary' : 'tertiary'"
					strong
					:secondary="checkedRowKeysRef.length > 0 ? false : true"
					:disabled="checkedRowKeysRef.length === 0 || hasReviewing"
					class="!px-8"
				>
					Initial Review
				</n-button>
			</n-space>
		</div>
		<n-data-table
			:row-key="rowKey"
			@update:checked-row-keys="handleCheck"
			:columns="columns"
			:data="candidateBAStore.candidates.data"
			:checked-row-keys="checkedRowKeysRef"
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
	</div>
</template>

<script lang="ts">
import { defineComponent, h, ref, computed, reactive, onMounted, watch } from "vue"
import { NDataTable, NButton, NPagination, NInput, NSpace, NAvatar } from "naive-ui"
import { Icon } from "@iconify/vue"

import { PAGE_SIZES } from "@/components/utils/constants"
import type { DataTableColumns, DataTableRowKey } from "naive-ui"
import { useCandidateBAStore } from "@/stores/useCandidateBAStore"
import _ from "lodash"
import { useRouter } from "vue-router"
import type { Candidate } from "./workspaceTypes"

export default defineComponent({
	name: "Work Space",
	components: {
		NDataTable,
		NPagination,
		NInput,
		NSpace,
		NButton,
		Icon
	},
	setup() {
		const candidateBAStore = useCandidateBAStore()
		const router = useRouter()
		const pagination = reactive({
			page: 1,
			limit: 10,
			claim: 1
		})
		const filterApi = reactive({
			name: ""
		})
		const checkedRowKeysRef = ref<DataTableRowKey[]>([])

		const columns = createColumns()
		function createColumns(): DataTableColumns<Candidate> {
			return [
				{
					type: "selection",
					width: "50px"
				},
				{
					title: "No.",
					key: "no",
					width: "50px",
					className: "w-6 whitespace-nowrap",
					render(row, index) {
						return h("div", index + 1)
					}
				},
				{
					title: "Candidate",
					key: "candidate",
					width: "300px",
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
					key: "brand",
					width: "300px",
					className: "whitespace-nowrap truncate !text-center",
					render(row: any) {
						const teamNames = row.brandAdvocacys
							?.flatMap((ba: any) => ba.teamBrandAdvocacy.map((tb: any) => tb?.team?.name))
							.filter((name: string | undefined) => name)
							.join(", ")

						return h("div", {class:"text-center truncate whitespace-nowrap !max-w-[300px]"},teamNames || "-")
					}
				},
				{
					title: "Child Information",
					key: "childInformation",
					className: "!text-center",
					width: "300px",
					render(row) {
						return h("div", {}, row.childrens.length + " คน")
					}
				},
				{
					title: "Review Status",
					key: "status",
					className: "!text-center",
					width: "300px",
					render(row) {
						return h("div", { class: "flex gap-x-6 justify-center items-center" }, [
							h(
								NButton,
								{
									icon: "mdi:eye-outline",
									class: [
										"!rounded-full",
										"!w-24",
										"!h-6",
										"!text-center",
										"!text-white",
										"!text-xs",
										row.is_review === 1 ? "!bg-[#FF4500]" : "!bg-[#27B5A3]"
									]
								},
								row.is_review === 1 ? "Reviewing" : "Approve"
							)
						])
					}
				},
				{
					title: "Action",
					className: "!text-center",
					key: "action",
					render(row) {
						return h("div", { class: "flex gap-x-6 justify-center items-center" }, [
							h(
								NButton,
								{
									class: "!rounded-md !text-center !text-white !px-12",
									type: "primary",
									size: "medium",
									onClick: async () => {
										const candidate = {
											candidate_id: row.id
										}
										try {
											if (row.is_review === 1 || row.candidateReviews.length > 0) {
												await candidateBAStore.getCandidateById(row.id)
												await candidateBAStore.getCandidateToReviewById(candidate)
												await router.push("/review")
												return
											}
											await candidateBAStore.getCandidateById(row.id)
											await candidateBAStore.getCandidateToReview(candidate)
											await candidateBAStore.getCandidateToReviewById({ ...candidate })
											await router.push("/review")
										} catch (error) {
											console.error("Error in initialReview:", error)
										}
									}
								},
								"Review"
							)
						])
					}
				}
			]
		}
		const handleSearch = _.debounce((value: string) => {
			filterApi.name = value
		}, 500)
		onMounted(async () => {
			await candidateBAStore.getCandidates({ ...pagination, ...filterApi })
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
		const paginateCount = computed(() => {
			const countPage = pagination.limit * pagination.page
			const totalTeams = candidateBAStore?.candidates?.total ?? 0
			return countPage > totalTeams ? totalTeams : countPage
		})
		const itemCount = computed(() => {
			return candidateBAStore?.candidates?.total || 0
		})
		async function initialReview() {
			const candidate = {
				candidate_id: checkedRowKeysRef.value
			}

			try {
				await candidateBAStore.getCandidateToReviewMany(candidate)
				checkedRowKeysRef.value = []
				await candidateBAStore.getCandidates({ ...pagination, ...filterApi })
			} catch (error) {
				console.error("Error in initialReview:", error)
			}
		}
		const hasReviewing = computed(() => {
			return candidateBAStore.candidates.data.some(
				(row: any) => checkedRowKeysRef.value.includes(row.id) && row.is_review === 1
			)
		})

		const reviewCount = computed(() => {
			return candidateBAStore.candidates.data.filter(
				(row: any) => checkedRowKeysRef.value.includes(row.id) && row.is_review === 1
			).length
		})
		return {
			pagination,
			columns,
			PAGE_SIZES,
			checkedRowKeysRef,
			rowKey: (row: any) => row.id,
			handleCheck(rowKeys: DataTableRowKey[]) {
				checkedRowKeysRef.value = rowKeys
			},
			handleSearch,
			candidateBAStore,
			paginateCount,
			itemCount,
			initialReview,
			hasReviewing,
			reviewCount
		}
	}
})
</script>
