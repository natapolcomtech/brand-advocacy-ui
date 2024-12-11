<template>
	<div class="gap-4 flex flex-col">
		<h1>Role</h1>
		<div class="flex flex-col md:flex-row justify-between gap-4">
			<div>
				<n-input type="text" placeholder="Search" size="large" :on-update:value="handleSearch">
					<template #suffix>
						<Icon icon="majesticons:search-line" style="color: #d1d1d1" width="24" />
					</template>
				</n-input>
			</div>
			<n-button @click="handleCreateRole" type="primary" size="large">
				<template #icon>
					<Icon icon="icons8:plus" />
				</template>
				Create Role
			</n-button>
		</div>
		<n-data-table
			:checked-row-keys="checkedRowKeysRef"
			:row-key="rowKey"
			:columns="column"
			:data="userManagementStore.getRolesData.data"
			@update:checked-row-keys="handleCheck"
			scroll-x="1000"
		/>
		<n-pagination
			:item-count="itemCount.total"
			:page-sizes="PAGE_SIZES"
			show-size-picker
			v-model:page="pagination.page"
			v-model:page-size="pagination.limit"
			class="justify-center mt-4"
		>
			<template #prefix>
				<div class="hidden md:block">
					({{ itemCount.startItem }} - {{ itemCount.endItem }}) Of {{ itemCount.total }} items
				</div>
			</template>
		</n-pagination>
		<n-modal
			v-model:show="isModalManagement.value"
			:mask-closable="false"
			preset="dialog"
			:title="titleModal"
			content="Are you sure?"
			style="width: 1400px"
		>
			<div class="grid gap-4 py-4">
				<n-form
					class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"
					ref="formRef"
					:model="dataRole"
					:rules="rules"
				>
					<n-form-item label="Role Name" label-col="6" content-col="18" path="role_name">
						<n-input v-model:value="dataRole.role_name" placeholder="Enter Name" />
					</n-form-item>
					<n-form-item label="Team Detail" label-col="6" content-col="18" path="role_description">
						<n-input v-model:value="dataRole.role_description" placeholder="Enter Description" />
					</n-form-item>
				</n-form>
				<h1>Permissions</h1>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<n-card size="medium" v-for="capability in capabilitys" :key="capability.name">
						<template #header>
							<div class="flex justify-between">
								<h4>{{ capability.name }}</h4>
							</div>
						</template>
						<n-grid :y-gap="8" :cols="1">
							<n-gi v-for="item in capability.item" :key="item.id">
								<n-checkbox
									:checked="isCheckedValue(item)"
									:value="item.id"
									:label="item.capability_code"
									:on-update:checked="checked => onChangeCheckbox(checked, item)"
								/>
							</n-gi>
						</n-grid>
					</n-card>
				</div>
				<n-space justify="end">
					<n-button @click="isModalManagement.value = false">Cancel</n-button>
					<n-button
						type="primary"
						@click="submitCreateForm"
						v-if="isModalManagement.event === MODAL_TYPE.CREATE"
					>
						Create
					</n-button>
					<n-button
						type="primary"
						@click="submitSaveForm"
						v-else-if="isModalManagement.event === MODAL_TYPE.EDIT"
					>
						Save
					</n-button>
				</n-space>
			</div>
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
	useDialog,
	NForm,
	NFormItem,
	NCard,
	NCheckboxGroup,
	NCheckbox,
	NGrid,
	NGi,
	NAvatarGroup,
	NAvatar,
	NPopover
} from "naive-ui"
import { Icon } from "@iconify/vue"
import type { DataTableColumns, DataTableRowKey, FormInst } from "naive-ui"
import { PAGE_SIZES } from "@/components/utils/constants"
import { MODAL_TYPE } from "@/views/UserManagement/User/index.vue"
import { useMasterDataStore } from "@/stores/useMasterDataStore"
import { useUserManagementStore } from "@/stores/userManagementStore"
import _ from "lodash"
interface RowData {
	id: number
	key?: number
	role: string
	teamUser: string | { firstName: string; lastName: string }[]
	role_capabilitys: any[]
}

export default defineComponent({
	name: "Role",
	components: {
		NDataTable,
		NModal,
		NPagination,
		NInput,
		NSpace,
		NButton,
		Icon,
		NForm,
		NFormItem,
		NCard,
		NCheckbox,
		NGrid,
		NGi
	},
	setup() {
		const formRef = ref<FormInst | null>(null)
		const masterDataStore = useMasterDataStore()
		const userManagementStore = useUserManagementStore()
		const dialog = useDialog()
		const capabilitys = ref<any>([])
		const pagination = reactive({
			page: 1,
			limit: 10
		})
		const filterApi = reactive({
			filter: ""
		})
		const handleSearch = _.debounce((value: string) => {
			filterApi.filter = value
		}, 500)
		watch(filterApi, async value => {
			pagination.page = 1
			/// Call API
			await userManagementStore.getRoles({ ...pagination, ...value })
		})
		watch(pagination, async value => {
			/// Call API
			await userManagementStore.getRoles({ ...value, ...filterApi })
		})
		onMounted(async () => {
			await masterDataStore.getCapability()
			await userManagementStore.getRoles(pagination)
			capabilitys.value = [...masterDataStore.capability]
		})
		const checkedRowKeysRef = ref<DataTableRowKey[]>([])
		const pageCount = computed(() => {
			const pageTotal = Math.ceil((userManagementStore.getRolesData.total as number) / pagination.limit)
			return pageTotal
		})
		const itemCount = computed(() => {
			const { page = "0", limit = "0", total = "0" } = userManagementStore.getRolesData
			const startItem = (Number(page) - 1) * Number(limit) + 1
			const endItem = Math.min(Number(page) * Number(limit), Number(total))
			return {
				total: userManagementStore.getRolesData.total,
				startItem,
				endItem
			}
		})
		const defaultValue = {
			role_name: "",
			role_description: "",
			role_capabilitys: [],
			id: 0
		}
		const isModalManagement = reactive({
			value: false,
			event: MODAL_TYPE.CREATE
		})
		const titleModal = computed(() => {
			switch (isModalManagement.event) {
				case MODAL_TYPE.CREATE:
					return "Create Role"
				case MODAL_TYPE.VIEW:
					return "View Role"
				case MODAL_TYPE.EDIT:
					return "Edit Role"
				default:
					return ""
			}
		})
		const dataRole = reactive<{
			role_name: string
			role_description: string
			role_capabilitys: any[]
			id: number
		}>({ ...defaultValue })
		const column = createColumns()
		function handleCreateRole(e: MouseEvent) {
			e.preventDefault()
			Object.assign(dataRole, { ...defaultValue })
			isModalManagement.value = true
			isModalManagement.event = MODAL_TYPE.CREATE
		}
		function convertTextToAvatar(text: string) {
			if (!text) {
				return "U"
			}
			const split = text.split(" ") /// split name by space
			/// if name is single
			if (split.length === 1) {
				return split[0][0]
			}
			/// if name is double
			return split[0][0] + split[1][0]
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
					render(row, index) {
						return h("div", {}, [h("p", {}, index + 1)])
					}
				},
				{
					title: "Role Name",
					key: "role_name"
				},
				{
					title: "Role Description",
					key: "role_description"
				},
				{
					title: "Role Capability",
					key: "userIDs",
					width: "150px",
					render(row) {
						const { role_capabilitys = [] } = row
						const createRolesName = role_capabilitys
							.filter((capability: any) => {
								return capability.is_active === 1
							})
							.map((role: any) => {
								const { capability = {} } = role
								return {
									name: (capability.capability_code || "").toUpperCase().replace("-", " "),
									src: ""
								}
							})
						return h(
							"span",
							{ class: "flex justify-start items-center w-full" },
							h(
								NAvatarGroup,
								{ options: createRolesName, size: 40, max: 3 },
								{
									avatar: ({ option }: any) =>
										h(
											NPopover,
											{ style: "max-width: 500px", trigger: "hover" },
											{
												trigger: () =>
													h(
														NAvatar,
														{
															style: "min-width: var(--n-merged-size); min-height: var(--n-merged-size);",
															color: "skyblue"
														},
														{ default: () => convertTextToAvatar(option.name) }
													),
												default: () => `${option.name}`
											}
										),
									rest: ({ options, rest }: any) => {
										return h(
											NPopover,
											{ style: "max-width: 500px", trigger: "click" },
											{
												trigger: () =>
													h(
														NAvatar,
														{
															style: "min-width: var(--n-merged-size); min-height: var(--n-merged-size);",
															color: "#1890FF"
														},
														{ default: () => `+${rest}` }
													),
												default: () =>
													h(
														"div",
														{ class: "grid gap-2" },
														options.map((option: any) => {
															return h("span", {}, `-  ${option.name}`)
														})
													)
											}
										)
									}
								}
							)
						)
					}
				},
				{
					title: "Action",
					key: "action",
					align: "center",
					render(row: any) {
						return h("div", { class: "flex gap-x-6 justify-center items-center" }, [
							h(Icon, {
								icon: "mdi:eye-outline",
								class: "w-6 h-6 cursor-pointer",
								onClick: async () => {
									await userManagementStore.getRoleById(row.id)
									const cloneData = _.cloneDeep(userManagementStore.getRoleByIdData)
									dataRole.role_name = cloneData.role_name
									dataRole.id = cloneData.id
									dataRole.role_description = cloneData.role_description
									dataRole.role_capabilitys = cloneData.role_capabilitys?.map((item: any) => {
										return {
											capability_id: item.capability_id,
											is_delete: item.is_delete,
											is_active: item.is_active
										}
									}) as any
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.VIEW
								}
							}),
							h(Icon, {
								icon: "flowbite:edit-outline",
								class: "w-6 h-6 cursor-pointer",
								onClick: async () => {
									await userManagementStore.getRoleById(row.id)
									const cloneData = _.cloneDeep(userManagementStore.getRoleByIdData)
									dataRole.role_name = cloneData.role_name
									dataRole.id = cloneData.id
									dataRole.role_description = cloneData.role_description
									dataRole.role_capabilitys = cloneData.role_capabilitys.map((item: any) => {
										return {
											capability_id: item.capability_id,
											is_delete: item.is_delete,
											is_active: item.is_active
										}
									}) as any
									isModalManagement.value = true
									isModalManagement.event = MODAL_TYPE.EDIT
								}
							}),
							h(Icon, {
								icon: "tabler:trash",
								class: "w-6 h-6 cursor-pointer",
								onClick: () => {
									dialog.warning({
										title: "ยืนยันการลบข้อมูล",
										content: `ข้อมูลที่ลบจะไม่สามารถกู้คืนได้ คุณแน่ใจที่จะลบข้อมูล ${row.role_name} หรือไม่ ?`,
										positiveText: "แน่ใจ",
										negativeText: "ยกเลิก",
										onPositiveClick: async () => {
											pagination.page = 1
											await userManagementStore.deleteRoleById(row.id, pagination)
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
		const rules = {
			role_name: [{ required: true, message: "Please enter role name", trigger: "blur" }],
			role_description: [{ required: true, message: "Please enter role description", trigger: "blur" }]
		}
		function submitCreateForm(e: MouseEvent) {
			e.preventDefault()
			formRef.value?.validate().then(async () => {
				let cloneData: Partial<typeof dataRole> = _.cloneDeep(dataRole)
				const role_capabilitys = cloneData.role_capabilitys?.filter((capability: any) => {
					return capability.is_active === 1
				})
				delete cloneData.id
				pagination.page = 1
				await userManagementStore.createRole({ ...cloneData, role_capabilitys }, pagination)
				Object.assign(dataRole, { ...defaultValue })
				isModalManagement.value = false
			})
		}
		function submitSaveForm(e: MouseEvent) {
			e.preventDefault()
			formRef.value?.validate().then(async () => {
				pagination.page = 1
				const { id, ...other } = dataRole
				const cloneData = _.cloneDeep(userManagementStore.getRoleByIdData)
				const role_capabilitys_user = (cloneData.role_capabilitys || []).map((item: any) => {
					return item.capability_id
				}) as any
				const role_capabilitys = other.role_capabilitys?.filter((capability: any) => {
					return role_capabilitys_user.includes(capability.capability_id) || capability.is_active === 1
				})
				await userManagementStore.updateRole({ ...other, role_capabilitys, role_id: id }, pagination)
				Object.assign(dataRole, { ...defaultValue })
				isModalManagement.value = false
			})
		}
		function onChangeCheckbox(checked: boolean, item: any) {
			const isHaveItem = dataRole.role_capabilitys.find((i: any) => i.capability_id === item.id)

			if (!isHaveItem) {
				(dataRole.role_capabilitys as any).push({ capability_id: item.id, is_delete: 0, is_active: 1 } as any)
			} else {
				const index = dataRole.role_capabilitys.findIndex((capability: any) => {
					return capability.capability_id === item.id
				})

				if (index > -1) {
					dataRole.role_capabilitys[index].is_active = checked ? 1 : 0
					dataRole.role_capabilitys[index].is_delete = checked ? 0 : 1
				}
			}
		}
		function isCheckedValue(item: any) {
			const isHaveItem = dataRole.role_capabilitys.find((i: any) => i.capability_id === item.id) as any
			return isHaveItem ? isHaveItem.is_active === 1 : false
		}
		return {
			checkedRowKeysRef,
			rowKey: (row: RowData) => row.id,
			handleCheck(rowKeys: DataTableRowKey[]) {
				checkedRowKeysRef.value = rowKeys
			},
			PAGE_SIZES,
			pagination,
			pageCount,
			itemCount,
			column,
			titleModal,
			handleCreateRole,
			isModalManagement,
			dataRole,
			masterDataStore,
			formRef,
			rules,
			submitCreateForm,
			submitSaveForm,
			MODAL_TYPE: MODAL_TYPE,
			userManagementStore,
			filterApi,
			capabilitys,
			onChangeCheckbox,
			isCheckedValue,
			handleSearch
		}
	}
})
</script>
