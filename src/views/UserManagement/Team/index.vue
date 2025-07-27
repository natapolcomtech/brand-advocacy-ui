<template>
	<div>
		<h1>Team</h1>
		<div class="mb-6 mt-4 flex flex-col md:flex-row justify-between gap-4">
			<n-input
				type="text"
				placeholder="Search"
				size="large"
				:on-update:value="handleSearch"
				class="md:!w-[260px]"
			>
				<template #suffix>
					<Icon icon="majesticons:search-line" style="color: #d1d1d1" width="24" />
				</template>
			</n-input>
			<n-button v-if="checkPermission(['um-manage-all'])" @click="handleCreateTeam" type="primary" size="large">
				<template #icon>
					<Icon icon="icons8:plus" />
				</template>
				Create Team
			</n-button>
		</div>

		<n-data-table
			:row-key="rowKey"
			:columns="column"
			:data="teamManagementStore.teams.data"
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
			v-if="isModalManagement.event !== MODAL_TYPE.PERMISSION"
			v-model:show="isModalManagement.value"
			:bordered="false"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '600px'
			}"
			:title="titleModal"
		>
			<n-form ref="formRef" :model="dataTeam" :disabled="isModalManagement.event === 'view'" :rules="rules">
				<n-form-item label="Team" path="name">
					<n-input v-model:value="dataTeam.name" type="text" placeholder="Enter Team" size="large" />
				</n-form-item>

				<n-form-item label="Add User" path="userTeam">
					<n-select
						id="selection-multiple"
						v-model:value="dataTeam.userTeam"
						multiple
						label-field="label"
						:options="selectUsers"
						:render-label="renderLabel"
						:render-tag="renderMultipleSelectTag"
						filterable
						placeholder="Enter Add Users"
						size="large"
						:on-search="onSearch"
						@update:value="handleUserChange"
					/>
				</n-form-item>

				<n-checkbox
					v-show="isModalManagement.event !== 'create'"
					v-model:checked="dataTeam.is_active"
					:disabled="isModalManagement.event === 'view'"
				>
					Active
				</n-checkbox>
			</n-form>
			<template #footer>
				<n-space justify="end">
					<n-button type="default" size="large" @click="handleCancelTeam">Cancel</n-button>
					<n-button
						type="primary"
						size="large"
						v-if="isModalManagement.event === 'edit'"
						@click="handleSubmitTeam"
					>
						Save
					</n-button>
					<n-button
						type="primary"
						size="large"
						v-if="isModalManagement.event === 'create'"
						@click="handleSubmitTeam"
					>
						Create
					</n-button>
				</n-space>
			</template>
		</n-modal>

		<n-modal
			v-if="isModalManagement.event == MODAL_TYPE.PERMISSION"
			v-model:show="isModalManagement.value"
			:mask-closable="false"
			preset="dialog"
			style="width: 1000px"
			:title="titleModal"
		>
			<template #header>
				<h3>{{ dataTeam.name }}</h3>
			</template>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<n-card size="medium" v-for="items in productOption" :key="items.id">
					<div class="flex justify-between">
						<p class="text-[#3B82F6] font-medium text-base mb-2">{{ items.name }}</p>
					</div>

					<n-grid :y-gap="8" :cols="1">
						<n-gi v-for="item in items.formulas" :key="item.formula_id">
							<n-checkbox
								:checked="isChecked(item.formula_id)"
								:label="item.name"
								@update:checked="handleUpdate(item.formula_id, $event)"
							/>
						</n-gi>
					</n-grid>
				</n-card>
			</div>
		</n-modal>
	</div>
</template>

<script lang="ts">
import { defineComponent, h, ref, computed, watch, reactive, onMounted } from "vue"
import {
	NDataTable,
	NModal,
	NPagination,
	NInput,
	NSpace,
	NSelect,
	NButton,
	NTag,
	NForm,
	NFormItem,
	NCheckbox,
	NSwitch,
	NAvatarGroup,
	useDialog,
	NDropdown,
	NTooltip,
	NAvatar,
	NGrid,
	NGi,
	NCard
} from "naive-ui"
import { Icon } from "@iconify/vue"
import type { DataTableColumns, DataTableRowKey, SelectRenderLabel, SelectRenderTag } from "naive-ui"
import type { FormInst, FormRules } from "naive-ui"

import { useTeamManagementStore } from "@/stores/useTeamManagementStore"
import { useUserManagementStore } from "@/stores/userManagementStore"
import { useMasterDataStore } from "@/stores/useMasterDataStore"
import { MODAL_TYPE } from "@/views/UserManagement/User/index.vue"
import { TEAM_OPTIONS, PAGE_SIZES } from "@/components/utils/constants"
import _ from "lodash"
import { checkPermission } from "@/utils/auth"
interface RowData {
	id: number
	key?: number
	name: string
	is_active?: number | boolean
	team_member: { id?: number; username?: string; email?: string; is_delete: number }[]
	userTeam?: number[]
}

export default defineComponent({
	name: "Team",
	components: {
		NDataTable,
		NModal,
		NPagination,
		NInput,
		NSpace,
		NButton,
		NSelect,
		Icon,
		NForm,
		NFormItem,
		NCheckbox,
		NGrid,
		NGi,
		NCard
	},
	setup() {
		const masterDataStore = useMasterDataStore()
		const userManagementStore = useUserManagementStore()
		const teamManagementStore = useTeamManagementStore()
		const brands = ref<any>([])
		const brandOption = computed(() =>
			brands.value.flatMap((brand: any) => ({
				label: brand.name,
				brand_id: brand.id
			}))
		)
		const productOption = computed(() =>
			brands.value.map((brand: any) => ({
				name: brand.name,
				brand_id: brand.id,
				formulas: brand.formulas.map((formula: any) => ({
					formula_id: formula.id,
					value: 0,
					name: formula.name,
					brand_id: brand.id
				}))
			}))
		)
		const dialog = useDialog()
		const checkedRowKeysRef = ref<DataTableRowKey[]>([])
		const formRef = ref<FormInst | null>(null)
		const selectUsers = ref()
		const searchQuery = ref("")
		const debounceTimeout = ref<number | null>(null)
		const defaultValue = {
			id: null,
			name: "",
			is_active: false,
			users: [{ user_id: null as number | null, is_delete: 0 }],
			userTeam: [],
			team_id: null,
			formulas: [
				{
					formula_id: 0,
					brand_id: 0,
					brand_name: "",
					formula_name: "",
					formula_description: ""
				}
			]
		}
		const pagination = reactive({
			page: 1,
			limit: 10
		})
		const filterApi = reactive({
			filter: ""
		})
		const dataTeam = reactive({ ...defaultValue })
		const column = createColumns()
		const pageCount = computed(() => {
			const pageTotal = Math.ceil((teamManagementStore?.teams?.total || 0) / pagination.limit)
			return pageTotal
		})
		const paginateCount = computed(() => {
			const countPage = pagination.limit * pagination.page
			const totalTeams = teamManagementStore?.teams?.total ?? 0
			return countPage > totalTeams ? totalTeams : countPage
		})
		const itemCount = computed(() => {
			return teamManagementStore?.teams?.total || 0
		})
		const isModalManagement = reactive({
			value: false,
			event: MODAL_TYPE.CREATE
		})
		const titleModal = computed(() => {
			switch (isModalManagement.event) {
				case MODAL_TYPE.CREATE:
					return "Create Team"
				case MODAL_TYPE.VIEW:
					return "View Team"
				case MODAL_TYPE.EDIT:
					return "Edit Team"
				case MODAL_TYPE.PERMISSION:
					return "Team Management Brand"
				default:
					return ""
			}
		})

		function handleCreateTeam(e: MouseEvent) {
			e.preventDefault()
			Object.assign(dataTeam, defaultValue)
			isModalManagement.value = true
			isModalManagement.event = MODAL_TYPE.CREATE
		}
		function handleCancelTeam(e: MouseEvent) {
			e.preventDefault()
			Object.assign(dataTeam, defaultValue)
			isModalManagement.value = false
		}
		function handleSubmitTeam(e: MouseEvent) {
			e.preventDefault()
			formRef.value?.validate(async errors => {
				if (!errors) {
					const bodyCreate = {
						id: dataTeam?.id,
						name: dataTeam.name,
						is_active: dataTeam.is_active ? 1 : 0,
						users: (dataTeam.users = dataTeam.userTeam.map((user: any) => ({
							user_id: typeof user === "object" ? user.id : user,
							is_active: 1,
							is_delete: 0
						})))
					}
					const allUsers = [
						...dataTeam.userTeam,
						...initialUserTeam.value.filter(user => !dataTeam.userTeam.includes(user))
					]
					const bodyEdit = {
						id: dataTeam?.id,
						name: dataTeam.name,
						is_active: dataTeam.is_active ? 1 : 0,
						users: allUsers.map(user => ({
							user_id: typeof user === "object" ? (user as { id: number }).id : user,
							is_active: 1,
							is_delete:
								initialUserTeam.value.some(
									initialUser =>
										initialUser ===
										(typeof user === "object" && user !== null ? (user as { id: number }).id : user)
								) && !dataTeam.userTeam.includes(user)
									? 1
									: 0
						}))
					}

					switch (isModalManagement.event) {
						case MODAL_TYPE.CREATE:
							await teamManagementStore.createTeam(bodyCreate, pagination)
							break
						case MODAL_TYPE.EDIT:
							await teamManagementStore.updateTeam(bodyEdit, pagination)
							break
						default:
							break
					}
					handleCancelTeam(e)
				} else {
					console.error(errors)
				}
			})
		}
		function createColumns(): DataTableColumns<RowData> {
			return [
				{
					type: "selection",
					width: "50px"
				},
				{
					title: "No.",
					key: "no",
					width: "50px",
					className: " whitespace-nowrap",
					render(row, index) {
						return h("div", pagination.limit * (pagination.page - 1) + index + 1)
					}
				},
				{
					title: "Team Name",
					key: "name",
					width: "250px",
					className: "whitespace-nowrap",
				},
				{
					title: "Users",
					key: "team_members",
					width: "250px",
					className: "whitespace-nowrap",
					render(row: RowData) {
						const options = Array.isArray(row.team_member)
							? row.team_member.map(member => ({
									name: member.username,
									initials: member.username ? member.username.charAt(0).toUpperCase() : "",
									src: ""
								}))
							: []
						const createDropdownOptions = (restOptions: any[]) => {
							return restOptions.map(option => ({
								label: option.name,
								key: option.name
							}))
						}
						return h(
							NAvatarGroup,
							{ size: 40, max: 2, options },
							{
								avatar: ({ option }: any) =>
									h(
										NTooltip,
										{
											trigger: "hover",
											placement: "top",
											content: option.name
										},
										{
											trigger: () =>
												h(
													NAvatar,
													{
														style: {
															color: "white",
															backgroundColor: "skyblue"
														}
													},
													option.initials
												),
											default: () => option.name
										}
									),
								rest: ({ rest }: any) =>
									h(
										NDropdown,
										{
											options: createDropdownOptions(options.slice(1)),
											placement: "top"
										},
										{
											default: () => h(NAvatar, {}, `+${rest}`)
										}
									)
							}
						)
					}
				},
				{
					title: "Active",
					key: "is_active",
					className: "!text-center whitespace-nowrap",
					render(row) {
						return h(NSwitch, {
							value: row.is_active === 1 ? true : false,
							disabled: true
						})
					}
				},
				{
					title: "Action",
					className: "!text-center !whitespace-nowrap",
					key: "action",
					render(row) {
						return h("div", { class: "flex gap-x-6 justify-center" }, [
							h(Icon, {
								icon: "mdi:eye-outline",
								class: "w-6 h-6 cursor-pointer",
								onClick: async (e: MouseEvent) => {
									e.preventDefault()
									await teamManagementStore.getTeamById(row.id)
									const { name, id, is_active, team_member } = (teamManagementStore.team as any).team
									Object.assign(dataTeam, {
										name,
										id,
										is_active: is_active === 1 ? true : false,
										userTeam: team_member?.map((member: { id?: number }) => member?.id),
										team_id: row.id
									})
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.VIEW
								}
							}),
							checkPermission(["um-manage-all"]) && h(Icon, {
								icon: "flowbite:edit-outline",
								class: "w-6 h-6 cursor-pointer",
								onClick: async (e: MouseEvent) => {
									e.preventDefault()
									await teamManagementStore.getTeamById(row.id)
									const { name, id, is_active, team_member } = (teamManagementStore.team as any).team
									Object.assign(dataTeam, {
										name,
										id,
										is_active: is_active === 1 ? true : false,
										userTeam: team_member?.map((member: { id?: number }) => member?.id)
									})
									initialUserTeam.value = [...dataTeam.userTeam]
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.EDIT
								}
							}),
							checkPermission(["um-manage-all"]) && h(Icon, {
								icon: "mdi:shield-key-outline",
								class: "w-6 h-6 cursor-pointer",
								onClick: async (e: MouseEvent) => {
									e.preventDefault()
									await teamManagementStore.getTeamById(row.id)
									await masterDataStore.getBrands()
									brands.value = masterDataStore.brands
									const { name, id, is_active, team_member, formulas } = (
										teamManagementStore.team as any
									).team
									Object.assign(dataTeam, {
										name,
										id,
										is_active: is_active === 1 ? true : false,
										userTeam: team_member?.map((member: { id?: number }) => member?.id),
										formulas: formulas,
										team_id: row.id
									})
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.PERMISSION
								}
							}),
							checkPermission(["um-manage-all"]) && h(Icon, {
								icon: "tabler:trash",
								class: "w-6 h-6 cursor-pointer",
								onClick: () => {
									dialog.warning({
										title: "ยืนยันการลบข้อมูล",
										content: `ข้อมูลที่ลบจะไม่สามารถกู้คืนได้ คุณแน่ใจที่จะลบข้อมูลทีม ${row.name} หรือไม่ ?`,
										positiveText: "แน่ใจ",
										negativeText: "ยกเลิก",
										onPositiveClick: async () => {
											await teamManagementStore.deleteTeam(row.id, pagination)
										},
										onNegativeClick: () => {
											// message.error("Not Sure")
										}
									})
								}
							})
						])
					}
				}
			]
		}

		const renderMultipleSelectTag: SelectRenderTag = ({ option, handleClose }) => {
			return h(
				NTag,
				{
					style: {
						padding: "10px 20px 10px 20px"
					},
					class: "!bg-[rgba(73,145,250,0.2)] !border !border-slate-300",
					round: true,
					closable: true,
					onClose: e => {
						e.stopPropagation()
						handleClose()
					}
				},
				{
					default: () =>
						h(
							"div",
							{
								class: "flex items-center"
							},
							[option.label as string]
						)
				}
			)
		}
		const renderLabel: SelectRenderLabel = option => {
			return h(
				"div",
				{
					class: "flex justify-between items-center"
				},
				[h("div", {}, [option.label as string])]
			)
		}

		const rules: FormRules = {
			name: {
				required: true,
				trigger: ["blur", "input"],
				message: "Please input Team"
			}
		}

		onMounted(async () => {
			const filter = {
				page: 1,
				limit: 100,
				filter: ""
			}
			await teamManagementStore.getTeams({ ...pagination, ...filterApi })
			await userManagementStore.getUsers({ ...pagination, ...filter })
			selectUsers.value = userManagementStore.users.data.map((user: any) => ({
				value: user.id,
				label: `${user.firstname} ${user.lastname}`
			}))
		})
		watch(pagination, async value => {
			/// Call API
			await teamManagementStore.getTeams({ ...value, ...filterApi })
		})
		watch(filterApi, async value => {
			pagination.page = 1
			/// Call API
			await teamManagementStore.getTeams({ ...pagination, ...value })
		})
		const handleSearch = _.debounce((value: string) => {
			filterApi.filter = value
		}, 500)
		const onSearch = (query: string) => {
			searchQuery.value = query
			const selectValue = {
				page: 1,
				limit: 10,
				filter: ""
			}
			selectValue.filter = query
			if (debounceTimeout.value) {
				clearTimeout(debounceTimeout.value)
			}
			debounceTimeout.value = window.setTimeout(async () => {
				await userManagementStore.getUsers(selectValue)
				selectUsers.value = userManagementStore?.users?.data.map((user: any) => ({
					value: user.id,
					label: `${user.firstname} ${user.lastname}`
				}))
			}, 200)
		}

		const initialUserTeam = ref([])
		function handleUserChange(value: any) {
			const removedUsers = initialUserTeam.value.filter(user => !value.includes(user))
			removedUsers.forEach(user => {
				const userIndex = dataTeam.users.findIndex(
					u => u.user_id === (typeof user === "object" && user !== null ? (user as { id: number }).id : user)
				)
				if (userIndex !== -1) {
					dataTeam.users[userIndex].is_delete = 1
				} else {
					dataTeam.users.push({
						user_id: typeof user === "object" && user !== null ? (user as { id: number }).id : user,
						is_delete: 1
					})
				}
			})

			dataTeam.userTeam = value
		}
		function isChecked(formula_id: number) {
			return dataTeam.formulas.some(formula => formula.formula_id === formula_id)
		}
		async function handleUpdate(formula_id: number, checked: any) {
			const formula = productOption.value
				.flatMap((option: any) => option.formulas)
				.find((f: any) => f.formula_id === formula_id)

			if (checked) {
				dataTeam.formulas.push({
					formula_id,
					brand_id: formula.brand_id,
					brand_name: "",
					formula_name: "",
					formula_description: ""
				})
				await teamManagementStore.postTeamAssign({
					team_id: dataTeam.team_id,
					formula_id: formula_id,
					brand_id: formula.brand_id
				})
			} else {
				const index = dataTeam.formulas.findIndex(formula => formula.formula_id === formula_id)
				if (index > -1) {
					dataTeam.formulas.splice(index, 1)
				}
				await teamManagementStore.postTeamUnAssign({
					team_id: dataTeam.team_id,
					formula_id: formula_id,
					brand_id: formula.brand_id
				})
			}
		}
		return {
			PAGE_SIZES,
			TEAM_OPTIONS,
			checkedRowKeysRef,
			rowKey: (row: RowData) => row.id,
			handleCheck(rowKeys: DataTableRowKey[]) {
				checkedRowKeysRef.value = rowKeys
			},
			renderLabel,
			renderMultipleSelectTag,
			column,
			titleModal,
			dataTeam,
			formRef,
			isModalManagement,
			rules,
			pageCount,
			itemCount,
			handleCreateTeam,
			handleCancelTeam,
			handleSubmitTeam,
			pagination,
			teamManagementStore,
			selectUsers,
			onSearch,
			paginateCount,
			handleUserChange,
			handleSearch,
			MODAL_TYPE,
			brandOption,
			productOption,
			isChecked,
			handleUpdate,
			// onScroll,
			checkPermission
		}
	}
})
</script>

<style>
/* .n-base-select-menu .n-base-select-option .n-base-select-option__content {
	width: 100%;
}

#selection-multiple .n-base-close.n-base-close--absolute {
	left: 10px;
} */
</style>
