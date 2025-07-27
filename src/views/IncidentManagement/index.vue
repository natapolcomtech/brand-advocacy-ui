<template>
	<div>
		<h1>Incident Management</h1>
		<div class="mb-6 mt-4 flex flex-col w-full gap-4">
			<n-space justify="end">
				<n-button @click="handleExportIncident" type="success" size="large" class="">
					<template #icon>
						<Icon icon="typcn:export-outline" />
					</template>
					Export Incident
				</n-button>
				<n-button
					v-if="checkPermission(['im-manage-all', 'im-case-create'])"
					@click="handleCreateIncident"
					type="primary"
					size="large"
				>
					<template #icon>
						<Icon icon="icons8:plus" />
					</template>
					Create Incident
				</n-button>
			</n-space>
			<div class="flex flex-col md:flex-row w-full gap-4">
				<n-input
					:on-update:value="value => handleSearch(value, 'input')"
					type="text"
					placeholder="Search case Id, case name"
					size="large"
					class="md:!w-[260px]"
				>
					<template #suffix>
						<Icon icon="majesticons:search-line" style="color: #d1d1d1" width="24" />
					</template>
				</n-input>
				<n-select
					:on-update:value="value => handleSearch(value, 'status_case')"
					class="md:!w-[260px]"
					size="large"
					:render-label="renderLabelCase"
					:render-tag="renderSelectCase"
					:options="INCIDENT_MANAGEMENT.CASE_OPTIONS"
					placeholder="Please Select Status Case"
					clearable
				/>

				<n-select
					:on-update:value="value => handleSearch(value, 'feedback_type')"
					class="md:!w-[260px]"
					size="large"
					:render-label="renderLabelTypeFeedback"
					:render-tag="renderSelectTypeFeedback"
					:options="INCIDENT_MANAGEMENT.INCIDENT_TYPE_OPTIONS"
					placeholder="Please Select Type Incident"
					clearable
				/>
			</div>

			<n-space>
				<n-date-picker
					v-model:value="filterApi.date"
					type="datetimerange"
					clearable
					size="large"
					class="md:!w-[535px] !w-full"
				/>
			</n-space>
		</div>
		<n-data-table
			:row-key="rowKey"
			:columns="column"
			:data="incidentManagementStore.incidents.data"
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

		<n-modal v-if="isModalManagement.event === MODAL_TYPE.CREATE" v-model:show="isModalManagement.value">
			<n-card
				:bordered="false"
				aria-modal="false"
				preset="card"
				size="huge"
				:style="{
					width: '1000px'
				}"
				:title="titleModal"
			>
				<template #header-extra>
					<n-button @click="handleCancel" type="tertiary" class="!mr-2">Cancel</n-button>
					<n-button @click="createIncident" type="success">Create</n-button>
				</template>

				<n-form ref="formRef" :model="incidentForm" :rules="rules">
					<n-grid :x-gap="12" cols="1 600:5" item-responsive>
						<n-gi span="2">
							<n-form-item label="Topic" path="topic">
								<n-select
									size="large"
									placeholder="Please Select Topic"
									v-model:value="incidentForm.topic"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="topicsOption"
									filterable
								/>
							</n-form-item>
						</n-gi>
						<n-gi>
							<n-form-item label="Sentiment Type" path="sentiment_type">
								<n-select
									size="large"
									v-model:value="incidentForm.sentiment_type"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="INCIDENT_MANAGEMENT.SENTIMENT_TYPE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Product" path="brand_id">
								<n-tree-select
									:options="productOption"
									size="large"
									v-model:value="incidentForm.formula_id"
									placeholder="Please Select Product"
									default-expand-all
									show-path
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Page Name" path="page_name">
								<n-input
									type="text"
									v-model:value="incidentForm.page_name"
									placeholder="Enter Page Name"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Link Incident " path="link_incident">
								<n-input
									type="text"
									v-model:value="incidentForm.link_incident"
									placeholder="Enter Link Incident"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Team" path="team_id">
								<n-select
									:options="teamAndBa.team_options"
									size="large"
									v-model:value="selectedCandidates"
									placeholder="Please Select Team"
									multiple
									filterable
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									@update-value="handleUpdateValue"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Status Incident Case" path="status_incident">
								<n-select
									size="large"
									v-model:value="incidentForm.status_incident"
									:render-label="renderLabelCase"
									:render-tag="renderSelectCase"
									:options="INCIDENT_MANAGEMENT.CASE_OPTIONS"
									disabled
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Social" path="social_id">
								<n-select
									size="large"
									v-model:value="incidentForm.social_id"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="socialOptions"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:2">
							<n-form-item label="BA Type" path="ba_type">
								<n-select
									size="large"
									v-model:value="incidentForm.ba_type"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="INCIDENT_MANAGEMENT.BA_TYPE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:3">
							<n-form-item label="Owner Link" path="owner_link">
								<n-input
									size="large"
									v-model:value="incidentForm.owner_link"
									type="text"
									placeholder="Enter Owner Link"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:2">
							<n-form-item label="Date Post" path="date_post">
								<n-date-picker
									size="large"
									v-model:value="incidentForm.date_post"
									type="date"
									class="w-full"
									format="dd/MM/yyyy"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:3">
							<n-form-item label="Type Close Incident Case" path="type_incident_after">
								<n-select
									size="large"
									v-model:value="incidentForm.type_incident_after"
									:render-label="renderLabelTypeFeedback"
									:render-tag="renderSelectTypeFeedback"
									:options="INCIDENT_MANAGEMENT.INCIDENT_TYPE_OPTIONS"
									:disabled="incidentForm.status_incident !== 3"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:2">
							<n-form-item label="Type Incident Case" path="type_incident_before">
								<n-select
									size="large"
									v-model:value="incidentForm.type_incident_before"
									:render-label="renderLabelTypeFeedback"
									:render-tag="renderSelectTypeFeedback"
									:options="INCIDENT_MANAGEMENT.INCIDENT_TYPE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Like" path="like">
								<n-input-number v-model:value="incidentForm.like_amount" class="w-full" placeholder="Please Enter Like"  :min="0" size="large">
									<template #minus-icon >
										<Icon icon="bi:dash-circle" width="24" height="24" class="mr-1"/> 
									</template>
									<template #add-icon>
										<Icon icon="simple-line-icons:plus" width="24" height="24" class="ml-1"/>
									</template>
								</n-input-number>
							</n-form-item>
						</n-gi>
						<n-gi span="1">
							<n-form-item label="Share" path="share">
								<n-input-number v-model:value="incidentForm.view_amount" class="w-full" placeholder="Please Enter Share"  :min="0" size="large">
									<template #minus-icon >
										<Icon icon="bi:dash-circle" width="24" height="24" class="mr-1"/> 
									</template>
									<template #add-icon>
										<Icon icon="simple-line-icons:plus" width="24" height="24" class="ml-1"/>
									</template>
								</n-input-number>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="view" path="view">
								<n-input-number v-model:value="incidentForm.share_amount" class="w-full" placeholder="Please Enter View"  :min="0" size="large">
									<template #minus-icon >
										<Icon icon="bi:dash-circle" width="24" height="24" class="mr-1"/> 
									</template>
									<template #add-icon>
										<Icon icon="simple-line-icons:plus" width="24" height="24" class="ml-1"/>
									</template>
								</n-input-number>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Description Before" path="description_before">
								<n-input
									size="large"
									v-model:value="incidentForm.description_before"
									type="textarea"
									placeholder="Enter Description Before"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Description After" path="description_after">
								<n-input
									size="large"
									v-model:value="incidentForm.description_after"
									type="textarea"
									placeholder="Enter Description After"
								/>
							</n-form-item>
						</n-gi>
					</n-grid>
				</n-form>
				<div v-for="(items, teamIndex) in incidentForm.candidate" :key="teamIndex">
					<n-card v-if="items.team_id !== 0" class="!rounded-xl !border-[#DADADA] mt-2">
						<n-space class="mb-4" justify="space-between">
							<span class="flex gap-2 justify-center items-center">
								<h4 class="text-[#2073DE]">Team</h4>
								<n-tag v-if="items.team_id" round type="success" class="!bg-[#2B405B]">
									Team : {{ items.team_name }}
								</n-tag>
							</span>

							<Icon
								class="cursor-pointer"
								@click="deleteTeamWithIndex(items.team_id, teamIndex, false)"
								icon="charm:circle-cross"
								width="24"
								height="24"
								style="color: #fe4c4c"
							/>
						</n-space>
						<n-space class="items-center mb-4">
							<n-checkbox
								:checked="items.checkBox"
								@update:checked="value => handleCheckboxChange(value, items.team_id)"
							>
								Assign Admin User
							</n-checkbox>
							<n-select
								placeholder="Please Select User"
								v-model:value="items.users"
								:render-label="renderLabel"
								:render-tag="renderMultipleSelectTag"
								:options="items.teamAndUserOptions"
								multiple
								class="md:!w-[400px]"
								:disabled="!items.checkBox"
							/>
						</n-space>

						<n-form
							v-for="(item, index) in items.ba"
							:key="index"
							ref="formRef"
							inline
							:model="incidentForm"
							:rules="rules"
						>
							<n-grid :x-gap="12" cols="2 600:8" item-responsive>
								<n-gi span="2 600:1">
									<n-form-item label="No." path="no_id">
										<n-input
											size="large"
											:value="(index + 1).toString()"
											type="text"
											disabled
											class="!bg-[#E5E7EB]"
										/>
									</n-form-item>
								</n-gi>
								<n-gi span="2 600:4">
									<n-form-item label="Name" path="name">
										<n-input
											size="large"
											v-model:value="item.name"
											type="text"
											placeholder="Enter Name"
										/>
									</n-form-item>
								</n-gi>
								<n-gi span="1 600:2">
									<n-form-item label="Point Case" path="point_case">
										<n-input
											size="large"
											v-model:value="item.point_case"
											type="text"
											disabled
											class="!bg-[#E5E7EB]"
										/>
									</n-form-item>
								</n-gi>
								<n-gi>
									<n-form-item
										class="cursor-pointer"
										@click="deleteBaWithIndex(teamIndex, index, false)"
									>
										<img class="m-auto" src="/images/icon/vector.svg" alt="vector" />
									</n-form-item>
								</n-gi>
								<n-gi span="2 600:5">
									<n-form-item label="Topic" path="topic">
										<n-select
											size="large"
											placeholder="Please Select Topic"
											v-model:value="item.topic"
											:render-label="renderLabel"
											:render-tag="renderMultipleSelectTag"
											:options="topicsOption"
											multiple
											filterable
										/>
									</n-form-item>
								</n-gi>
							</n-grid>
						</n-form>

						<template #footer>
							<n-button
								@click="handleOpenModalRandom(items.team_id, teamIndex)"
								class="!w-full"
								type="primary"
								size="large"
							>
								<template #icon>
									<Icon icon="icons8:plus" />
								</template>
								Add BA
							</n-button>
						</template>
					</n-card>
				</div>
			</n-card>
		</n-modal>

		<n-modal
			v-if="isModalManagement.event === MODAL_TYPE.VIEW"
			v-model:show="isModalManagement.value"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '800px'
			}"
			:title="titleModal"
			:bordered="false"
		>
			<n-space>
				<n-button
					size="tiny"
					:type="
						incidentForm.type_incident_before === 1
							? 'success'
							: incidentForm.type_incident_before === 3
								? 'error'
								: 'tertiary'
					"
					ghost
					round
				>
					{{ statusIncidentType }}
				</n-button>
				<n-button size="tiny" :type="incidentForm.status_incident !== 3 ? 'info' : 'error'" round>
					{{ statusIncidentCase }}
				</n-button>
			</n-space>
			<n-space class="mt-4 border-b pb-4">
				<Icon icon="mingcute:folder-open-fill" width="24" height="24" color="#092C4D" />
				<h4>{{ incidentForm.topic }}</h4>
			</n-space>
			<n-space class="mt-8" vertical>
				<h4>Link Case</h4>
				<p class="mt-2">Type Link : {{ incidentForm.sentiment_type }}</p>
				<div class="flex gap-4 mt-2 items-center">
					<Icon icon="bx:link" width="24" height="24" color="#4285F4" />
					<a :href="incidentForm.link_incident" class="no-underline">
						{{ incidentForm.link_incident }}
					</a>
				</div>
			</n-space>
			<n-space class="mt-8" vertical>
				<h4>ทีม</h4>
				<p class="mt-2 pl-5">{{ incidentForm.team_name ? incidentForm.team_name : "-" }}</p>
			</n-space>
			<n-space class="mt-8 mb-2" vertical>
				<h4>ยี่ห้อผลิตภัณฑ์ (Product)</h4>
				<p class="flex flex-col gap-1 pl-5">
					{{ incidentForm.formulas.brand.name ? incidentForm.formulas.brand.name : "-" }}
				</p>
			</n-space>
			<n-space class="mt-8 border-b pb-4" vertical>
				<h4>สูตรนมผง (Formula)</h4>
				<span>
					<ul class="flex flex-col pl-5">
						<li>
							{{ incidentForm.formulas.name ? incidentForm.formulas.name : "-" }}
						</li>
						<p class="text-sm text-[#858C94]">
							{{ incidentForm.formulas.description ? incidentForm.formulas.description : "-" }}
						</p>
					</ul>
				</span>
			</n-space>
			<n-space class="mt-8" vertical>
				<div class="flex flex-col gap-y-4">
					<span class="md:flex gap-2">
						<p class="text-sm text-[#9CA3AF] w-[150px]">Team</p>
						<span>
							<p class="whitespace-normal mt-2 md:mt-0">
								{{ incidentForm.team_name ?? "-" }}
							</p>
						</span>
					</span>

					<div
						class="md:flex gap-y-4"
						v-for="(name, index) in incidentForm?.incidentBrandAdvocacys.filter(
							name => name?.brandAdvocacy?.candidate
						)"
						:key="index"
					>
						<p class="text-sm text-[#9CA3AF] w-[150px]">Assignee BA</p>
						<div class="flex gap-2 mt-2 md:mt-0">
							<n-avatar
								class="!w-5 !h-5 rounded-full"
								:style="{
									color: 'white',
									backgroundColor: 'skyblue',
									borderRadius: '100%'
								}"
							>
								{{ name.brandAdvocacy?.candidate.firstname[0] }}
							</n-avatar>
							<p
								class="text-sm text-[#4B5563] font-medium whitespace-nowrap max-w-[200px] md:max-w-[300px]"
							>
								{{ name.brandAdvocacy?.candidate.firstname }}
								{{ name.brandAdvocacy?.candidate.lastname }}
							</p>
						</div>
					</div>
				</div>
			</n-space>
		</n-modal>

		<n-modal v-if="isModalManagement.event === MODAL_TYPE.EDIT" v-model:show="isModalManagement.value">
			<n-card
				:bordered="false"
				aria-modal="false"
				preset="card"
				size="huge"
				:style="{
					width: '1000px'
				}"
				:title="titleModal"
			>
				<template #header-extra>
					<n-button @click="handleCancel" class="!mr-2">Cancel</n-button>
					<n-button type="primary" @click="updateIncident">Save</n-button>
				</template>

				<n-form ref="formRef" :model="incidentForm" :rules="rules">
					<n-grid :x-gap="12" cols="1 600:5" item-responsive>
						<n-gi span="2">
							<n-form-item label="Topic" path="topic">
								<n-select
									size="large"
									placeholder="Please Select Topic"
									v-model:value="incidentForm.topic"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="topicsOption"
									filterable
								/>
							</n-form-item>
						</n-gi>
						<n-gi>
							<n-form-item label="Sentiment Type" path="sentiment_type">
								<n-select
									size="large"
									v-model:value="incidentForm.sentiment_type"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="INCIDENT_MANAGEMENT.SENTIMENT_TYPE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Product" path="brand_id">
								<n-tree-select
									:options="productOption"
									size="large"
									v-model:value="incidentForm.formula_id"
									placeholder="Please Select Product"
									default-expand-all
									show-path
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Page Name" path="page_name">
								<n-input
									type="text"
									v-model:value="incidentForm.page_name"
									placeholder="Enter Page Name"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Link Incident " path="link_incident">
								<n-input
									type="text"
									v-model:value="incidentForm.link_incident"
									placeholder="Enter Link Incident"
									size="large"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Team" path="team_id">
								<n-select
									:options="teamAndBa.team_options"
									size="large"
									v-model:value="selectedCandidates"
									placeholder="Please Select Team"
									multiple
									filterable
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									@update-value="handleUpdateValue"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Status Incident Case" path="status_incident">
								<n-select
									size="large"
									v-model:value="incidentForm.status_incident"
									:render-label="renderLabelCase"
									:render-tag="renderSelectCase"
									:options="INCIDENT_MANAGEMENT.CASE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Social" path="social_id">
								<n-select
									size="large"
									v-model:value="incidentForm.social_id"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="socialOptions"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:2">
							<n-form-item label="BA Type" path="ba_type">
								<n-select
									size="large"
									v-model:value="incidentForm.ba_type"
									:render-label="renderLabel"
									:render-tag="renderMultipleSelectTag"
									:options="INCIDENT_MANAGEMENT.BA_TYPE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:3">
							<n-form-item label="Owner Link" path="owner_link">
								<n-input
									size="large"
									v-model:value="incidentForm.owner_link"
									type="text"
									placeholder="Enter Owner Link"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:2">
							<n-form-item label="Date Post" path="date_post">
								<n-date-picker
									size="large"
									v-model:value="incidentForm.date_post"
									type="date"
									class="w-full"
									format="dd/MM/yyyy"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:3">
							<n-form-item label="Type Close Incident Case" path="type_incident_after">
								<n-select
									size="large"
									v-model:value="incidentForm.type_incident_after"
									:render-label="renderLabelTypeFeedback"
									:render-tag="renderSelectTypeFeedback"
									:options="INCIDENT_MANAGEMENT.INCIDENT_TYPE_OPTIONS"
									:disabled="incidentForm.status_incident !== 3"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="1 600:2">
							<n-form-item label="Type Incident Case" path="type_incident_before">
								<n-select
									size="large"
									v-model:value="incidentForm.type_incident_before"
									:render-label="renderLabelTypeFeedback"
									:render-tag="renderSelectTypeFeedback"
									:options="INCIDENT_MANAGEMENT.INCIDENT_TYPE_OPTIONS"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Like" path="like">
								<n-input-number v-model:value="incidentForm.like_amount" class="w-full" placeholder="Please Enter Like" :min="0" size="large">
									<template #minus-icon >
										<Icon icon="bi:dash-circle" width="24" height="24" class="mr-1"/> 
									</template>
									<template #add-icon>
										<Icon icon="simple-line-icons:plus" width="24" height="24" class="ml-1"/>
									</template>
								</n-input-number>
							</n-form-item>
						</n-gi>
						<n-gi span="1">
							<n-form-item label="Share" path="share">
								<n-input-number v-model:value="incidentForm.view_amount" class="w-full" placeholder="Please Enter Share" :min="0" size="large">
									<template #minus-icon >
										<Icon icon="bi:dash-circle" width="24" height="24" class="mr-1"/> 
									</template>
									<template #add-icon>
										<Icon icon="simple-line-icons:plus" width="24" height="24" class="ml-1"/>
									</template>
								</n-input-number>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="view" path="view">
								<n-input-number v-model:value="incidentForm.share_amount" class="w-full" placeholder="Please Enter View" :min="0" size="large">
									<template #minus-icon >
										<Icon icon="bi:dash-circle" width="24" height="24" class="mr-1"/> 
									</template>
									<template #add-icon>
										<Icon icon="simple-line-icons:plus" width="24" height="24" class="ml-1"/>
									</template>
								</n-input-number>
							</n-form-item>
						</n-gi>
						<n-gi span="3">
							<n-form-item label="Description Before" path="description_before">
								<n-input
									size="large"
									v-model:value="incidentForm.description_before"
									type="textarea"
									placeholder="Enter Description Before"
								/>
							</n-form-item>
						</n-gi>
						<n-gi span="2">
							<n-form-item label="Description After" path="description_after">
								<n-input
									size="large"
									v-model:value="incidentForm.description_after"
									type="textarea"
									placeholder="Enter Description After"
								/>
							</n-form-item>
						</n-gi>
					</n-grid>
				</n-form>

				<div v-for="(items, teamIndex) in incidentForm.candidate" :key="teamIndex">
					<n-card v-if="items.is_delete !== 1" class="!rounded-xl !border-[#DADADA] mt-2">
						<n-space class="mb-4" justify="space-between">
							<span class="flex gap-2">
								<h4 class="text-[#2073DE]">Team</h4>
								<n-tag v-if="items.team_id" round type="success" class="!bg-[#2B405B]">
									Team : {{ items.team_name }}
								</n-tag>
							</span>

							<Icon
								class="cursor-pointer"
								@click="deleteTeamWithIndex(items.team_id, teamIndex, true)"
								icon="charm:circle-cross"
								width="24"
								height="24"
								style="color: #fe4c4c"
							/>
						</n-space>
						<n-space class="items-center mb-4">
							<n-checkbox
								:checked="items.checkBox"
								@update:checked="value => handleCheckboxChange(value, items.team_id)"
							>
								Assign Admin User
							</n-checkbox>
							<n-select
								placeholder="Please Select User"
								v-model:value="items.users"
								:render-label="renderLabel"
								:render-tag="renderMultipleSelectTag"
								:options="items.teamAndUserOptions"
								multiple
								class="md:!w-[400px]"
								:disabled="!items.checkBox"
								@update:value="handleAssignUsers($event, teamIndex)"
							/>
						</n-space>
						<div v-for="(item, index) in items.ba" :key="index">
							<n-form
								v-if="item.is_delete === 0"
								ref="formRef"
								inline
								:model="incidentForm"
								:rules="rules"
							>
								<n-grid :x-gap="12" cols="2 600:8" item-responsive>
									<n-gi span="2 600:1">
										<n-form-item label="No." path="no_id">
											<n-input
												size="large"
												:value="(index + 1).toString()"
												type="text"
												disabled
												class="!bg-[#E5E7EB]"
											/>
										</n-form-item>
									</n-gi>
									<n-gi span="2 600:4">
										<n-form-item label="Name" path="name">
											<n-input
												size="large"
												v-model:value="item.name"
												type="text"
												placeholder="Enter Name"
											/>
										</n-form-item>
									</n-gi>
									<n-gi span="1 600:2">
										<n-form-item label="Point Case" path="point_case">
											<n-input
												size="large"
												v-model:value="item.point_case"
												type="text"
												:disabled="incidentForm.status_incident === 1"
												:class="` ${incidentForm.status_incident === 1 ? '!bg-[#E5E7EB]' : ''} `"
											/>
										</n-form-item>
									</n-gi>
									<n-gi>
										<n-form-item
											class="cursor-pointer"
											@click="deleteBaWithIndex(teamIndex, index, true)"
										>
											<img class="m-auto" src="/images/icon/vector.svg" alt="vector" />
										</n-form-item>
									</n-gi>
									<n-gi span="2 600:5">
										<n-form-item label="Topic" path="topic">
											<n-select
												size="large"
												placeholder="Please Select Topic"
												v-model:value="item.topic"
												:render-label="renderLabel"
												:render-tag="renderMultipleSelectTag"
												:options="topicsOption"
												multiple
												filterable
											/>
										</n-form-item>
									</n-gi>
								</n-grid>
							</n-form>
						</div>
						<template #footer>
							<n-button
								@click="handleOpenModalRandom(items.team_id, teamIndex)"
								class="!w-full"
								type="primary"
								size="large"
							>
								<template #icon>
									<Icon icon="icons8:plus" />
								</template>
								Add BA
							</n-button>
						</template>
					</n-card>
				</div>
			</n-card>
		</n-modal>

		<n-modal
			v-model:show="isModalManagement.randomModal"
			aria-modal="false"
			preset="card"
			size="huge"
			:style="{
				width: '800px'
			}"
			title="Selected BA"
			:bordered="false"
			@close="handleCloseSelectedBa"
		>
			<n-grid :x-gap="12" cols="1" item-responsive>
				<n-gi>
					<n-form-item label="Number Of BA" path="no">
						<n-select
							:options="numberOfBaOptions"
							size="large"
							placeholder="Please Select Number Of BA"
							filterable
							:render-label="renderLabel"
							:render-tag="renderMultipleSelectTag"
							v-model:value="selectedBa.no"
							@update-value="handleUpdateValueBaNo"
						/>
					</n-form-item>
				</n-gi>
				<n-gi>
					<n-form-item label="BA List" path="amount">
						<n-select
							:options="
								teamAndBa.team_options
									.flatMap(option => option.ba)
									.filter(ba => ba.team_id === selectedBa.team_id)
							"
							size="large"
							placeholder="Please Select BA"
							multiple
							filterable
							:render-label="renderLabel"
							:render-tag="renderMultipleSelectTag"
							@update-value="handleUpdateValueBa"
							v-model:value="selectedBa.key"
							:disabled="(selectedBa.key?.length ?? 0) >= (selectedBa.no ?? 0)"
						/>
					</n-form-item>
				</n-gi>
			</n-grid>
		</n-modal>
	</div>
</template>

<script lang="ts">
import { defineComponent, h, reactive, ref, computed, onMounted, watch } from "vue"
import {
	NDataTable,
	NModal,
	NSelect,
	NPagination,
	NSpace,
	NInput,
	NButton,
	NForm,
	NFormItem,
	NGrid,
	NGi,
	NTag,
	NCard,
	NTreeSelect,
	NAvatar,
	useDialog,
	NDatePicker,
	NCheckbox,
	NInputNumber
} from "naive-ui"
import { Icon } from "@iconify/vue"
import { useTeamManagementStore } from "@/stores/useTeamManagementStore"
import { useMasterDataStore } from "@/stores/useMasterDataStore"
import { useIncidentManagementStore } from "@/stores/useIncidentManagement"
import {
	renderMultipleSelectTag,
	renderMultipleSelectTagPoint,
	renderSelectTypeFeedback,
	renderLabelTypeFeedback,
	renderLabel,
	renderSelectCase,
	renderLabelCase
} from "@/components/common/SelectNaiveStyle"

import type { DataTableColumns, DataTableRowKey, TreeSelectOverrideNodeClickBehavior, TreeSelectOption } from "naive-ui"
import { PAGE_SIZES, INCIDENT_MANAGEMENT } from "@/components/utils/constants"
import { MODAL_TYPE } from "@/views/UserManagement/User/index.vue"
import type { FormInst, FormRules } from "naive-ui"
import { toRaw } from "vue"
import { useRouter } from "vue-router"
import _ from "lodash"
import { checkPermission } from "@/utils/auth"
import moment from "moment"
interface RowData {
	id: number
	key?: number
	feedback: string
	typeFeedback: string
	name: string
	status: string
	reporter: { firstName: string; lastName: string }
	incidentBrandAdvocacys: {
		team: { id: number; name: string }
		brandAdvocacy: { candidate: { firstname: string; lastname: string }; team: { name: string } }
	}[]
	sentiment_type: string
	team_id: number
	status_incident: number
	topic: string
	type_incident_before: number
	formula: { formula: { brand: { name: string }; name: string; description: string }[] }[]
	description_before: string
	description_after: string
	owner_link: string
	created_at: string
	incidentTeams: { team: { name: string } }[]
	formulas: { brand: string; formula: string; description: string }[]
	date_post: string
	like_amount: number
	share_amount: number
	view_amount: number
}
interface Ba {
	name: string
	point_case: string
	brand_advocacy_id: number
	is_active: number
	is_delete: number
	topic: []
}
interface TeamOption {
	label: string
	value: number
	ba: Array<{
		label: string
		value: number
		team_id: number
		team_name: string
		is_active: number
		is_delete: number
		topic: []
	}>
}
export default defineComponent({
	name: "IncidentManagement",
	components: {
		NDataTable,
		NModal,
		NPagination,
		NSpace,
		NInput,
		NButton,
		NForm,
		NFormItem,
		NGrid,
		NGi,
		NTag,
		NSelect,
		NTreeSelect,
		NCard,
		NAvatar,
		NDatePicker,
		NCheckbox,
		Icon,
		NInputNumber
	},
	setup() {
		const teamManagementStore = useTeamManagementStore()
		const masterDataStore = useMasterDataStore()
		const incidentManagementStore = useIncidentManagementStore()
		const router = useRouter()
		const dialog = useDialog()
		const showModalRef = ref(false)
		const checkedRowKeysRef = ref<DataTableRowKey[]>([])
		const formRef = ref<FormInst | null>(null)
		const brands = ref<any>([])
		const brandOption = computed(() =>
			brands.value.map((brand: any) => ({
				label: brand.name,
				value: brand.id
			}))
		)
		const topicsOption = computed(() =>
			masterDataStore.topics.map((topic: any) => ({
				label: topic.topic_name,
				value: topic.topic_name
			}))
		)
		const teamAndBa = reactive({
			team: [
				{
					label: "Team 1",
					key: null,
					children: [
						{
							label: "BA 1",
							key: null
						}
					]
				}
			],
			team_options: [] as TeamOption[]
		})
		const randomBaOptions = ref<any>([])
		const socialOptions = ref<any>([])
		const productOption = computed(() =>
			brands.value.map((brand: any) => ({
				label: brand.name,
				key: brand.id,
				children: brand.formulas.map((formula: any) => ({
					label: formula.name,
					brand_id: brand.id,
					key: `${brand.id}_${formula.id}`,
					description: formula.description
				}))
			}))
		)

		const teamOptions = ref<any>([])
		const defaultValue = {
			id: 0,
			topic: null,
			sentiment_type: "Post",
			brand_id: 0,
			formula_id: "",
			page_name: "",
			link_incident: "",
			team_id: 0,
			status_incident: 1,
			social_id: 1,
			ba_type: "ba_mom",
			owner_link: "",
			type_incident_before: 1,
			type_incident_after: 2,
			description_before: "",
			description_after: "",
			date_post: null,
			team: { team: { name: "" } },
			formulas: { brand: { name: "" }, name: "", description: "" },
			incidentBrandAdvocacys: [
				{ brandAdvocacy: { candidate: { firstname: "", lastname: "" } } },
				{ team_id: null, team: { name: "" }, point: "0" },
				{ team: { name: "" } }
			],
			ba_id: null,
			candidate: [
				{
					team_id: 0,
					team_name: "",
					is_active: 1,
					is_delete: 0,
					no: 0,
					checkBox: false,
					users: [],
					usersSelected: [
						{
							user_id: 0,
							is_active: 1,
							is_delete: 0
						}
					],
					teamAndUserOptions: [],
					ba: [
						{
							name: "",
							point_case: "",
							brand_advocacy_id: 0,
							is_active: 1,
							is_delete: 0,
							topic: []
						}
					]
				}
			],
			amount: 1,
			team_name: "",
			all_ba: [],
			incidentTeams: [],
			like_amount: 0,
			share_amount: 0,
			view_amount: 0
		}
		const incidentForm = reactive({ ...defaultValue })
		const isModalManagement = reactive({
			value: false,
			event: MODAL_TYPE.VIEW,
			randomModal: false
		})
		const titleModal = computed(() => {
			switch (isModalManagement.event) {
				case MODAL_TYPE.CREATE:
					return "Create Incident"
				case MODAL_TYPE.VIEW:
					return "Detail Incident Case"
				case MODAL_TYPE.EDIT:
					return "Edit Incident"
				case MODAL_TYPE.RANDOM:
					return "Select BA"
				default:
					return ""
			}
		})
		const oldIncidentFormCandidate = ref()
		function createColumns(): DataTableColumns<RowData> {
			return [
				{
					title: "No.",
					key: "no",
					width: "50px",
					className: "!text-center max-w-[50px] whitespace-nowrap",
					render(row, index) {
						return h("div", pagination.limit * (pagination.page - 1) + index + 1)
					}
				},
				{
					title: "Feedback Title",
					key: "feedback",
					width: "200px",
					className: "",
					render(row) {
						return h("div", { className: "max-w-[200px] whitespace-nowrap truncate" }, row.topic)
					}
				},
				{
					title: "Sentiment Type",
					key: "sentiment_type",
					width: "120px",
					className: "max-w-[100px] !text-center whitespace-nowrap truncate text-[#2B405B]",
					render(row) {
						return h("div", row.sentiment_type)
					}
				},
				{
					title: "Type Feedback",
					key: "feedback",
					width: "150px",
					className: "max-w-[150px] !text-center font-medium whitespace-nowrap truncate",
					render(row) {
						return h(
							"div",
							{
								className: `${row.type_incident_before === 1 ? "text-[#209788]" : row.type_incident_before === 3 ? "text-[#FF6D83]" : "text-[#2B405B]"}`
							},
							row.type_incident_before === 1
								? "Positive"
								: row.type_incident_before === 3
									? "Negative"
									: "Neutral"
						)
					}
				},
				{
					title: "Team",
					key: "team",
					width: "200px",
					align: "center",
					render(row) {
						const teamNames = Array.from(
							new Set(
								row.incidentTeams
									.map((team: { team: { name: string } }) => team?.team?.name)
									.filter(name => name !== undefined)
							)
						).join(", ")
						return h("div", teamNames || "-")
					}
				},
				{
					title: "Status Case",
					key: "status",
					width: "160px",
					className: "!text-center max-w-[160px]",
					render(row) {
						return h(NSelect, {
							options: INCIDENT_MANAGEMENT.CASE_OPTIONS,
							"v-model:value": row.status_incident,
							value: row.status_incident,
							renderLabel: renderLabelCase,
							renderTag: renderSelectCase,
							onUpdateValue: async (value: number) => {
								row.status_incident = value
								const body = {
									incident_id: row.id,
									status_incident: value
								}
								await incidentManagementStore.updateIncident(body)
							}
						})
					}
				},
				{
					title: "Create Date",
					key: "created_at",
					width: "250px",
					className: "max-w-[200px] !text-center whitespace-nowrap",
					render(row) {
						return h("div", { class: "space-y-2" }, moment(row.created_at).format("DD/MM/YYYY HH:mm"))
					}
				},
				{
					title: "Action",
					className: "!text-center",
					key: "action",
					width: "100px",
					render(row) {
						return h("div", { class: "flex gap-x-6 justify-center items-center" }, [
							checkPermission(["im-manage-all", "im-case-view"]) &&
								h(Icon, {
									icon: "mdi:eye-outline",
									class: "w-6 h-6 cursor-pointer",
									onClick: async (e: MouseEvent) => {
										e.preventDefault()
										await incidentManagementStore.getIncidentById(row.id)

										const teamNames = Array.from(
											new Set(
												row.incidentTeams
													.map((team: { team: { name: string } }) => team?.team?.name)
													.filter(name => name !== undefined)
											)
										).join(", ")
										const formula = incidentManagementStore.incident.formula
										Object.assign(incidentForm, incidentManagementStore.incident, {
											team_name: teamNames,
											formulas: formula
										})
										isModalManagement.value = true
										isModalManagement.event = MODAL_TYPE.VIEW
									}
								}),
							h(Icon, {
								icon: "icon-park-outline:view-grid-detail",
								class: "w-6 h-6 cursor-pointer",
								onClick: async () => {
									router.push("/incident-management/payment-detail")
								}
							}),
							checkPermission(["im-manage-all", "im-case-create", "im-case-review"]) &&
								h(Icon, {
									icon: "flowbite:edit-outline",
									class: "w-6 h-6 cursor-pointer",
									onClick: async () => {
										await incidentManagementStore.getIncidentById(row.id)
										await masterDataStore.getTopic()
										const candidate =
											await incidentManagementStore.incident.incidentBrandAdvocacys.reduce(
												async (accPromise: Promise<any[]>, brand: any) => {
													const acc = await accPromise
													const teamIndex = acc.findIndex(
														(team: any) => team?.team_id === brand?.team?.id
													)
													const candidateData = brand?.brandAdvocacy?.candidate || {}
													const baData = {
														name: `${candidateData.firstname || ""} ${candidateData.lastname || ""}`,
														point_case: brand.point,
														brand_advocacy_id: brand.brand_advocacy_id,
														is_active: candidateData.is_active,
														is_delete: candidateData.is_delete,
														topic: brand?.incidentBrandAdvocacyTopics?.map(
															(topic: any) => topic.topicMaster?.topic_name
														)
													}
													const incidentTeam =
														incidentManagementStore.incident.incidentTeams.find(
															(team: any) => team?.team_id === brand?.team?.id
														)

													if (teamIndex === -1) {
														const params = {
															team_id: incidentTeam.team_id
														}
														const res = await incidentManagementStore.getTeamUsers(params)
														const mappingOption = res?.map((item: any) => ({
															value: item?.user?.id,
															label: `${item?.user?.firstname} ${item?.user?.lastname}`
														}))

														acc.push({
															team_id: incidentTeam?.team_id,
															team_name: incidentTeam?.team?.name,
															is_active: incidentTeam?.is_active,
															is_delete: incidentTeam?.is_delete,
															no: incidentTeam ? incidentTeam.no : 0,
															checkBox: incidentTeam?.incidentTeamUsers?.length > 0,
															teamAndUserOptions: mappingOption,
															users: incidentTeam?.incidentTeamUsers?.map(
																(user: any) => user?.user_id
															),
															usersSelected:
																incidentTeam?.incidentTeamUsers?.map((user: any) => {
																	return {
																		user_id: user?.user_id,
																		is_active: user?.user?.is_active,
																		is_delete: user?.user?.is_delete
																	}
																}) ?? [],
															ba: [baData]
														})
													} else {
														acc[teamIndex].ba.push(baData)
													}

													return acc
												},
												Promise.resolve([])
											)

										for (const team of incidentManagementStore.incident?.incidentTeams ?? []) {
											const teamExists = candidate.find((t: any) => t.team_id === team.team_id)
											if (!teamExists) {
												const params = {
													team_id: team.team_id
												}
												const res = await incidentManagementStore.getTeamUsers(params)
												const mappingOption = res?.map((item: any) => ({
													value: item?.user?.id,
													label: `${item?.user?.firstname} ${item?.user?.lastname}`
												}))

												candidate.push({
													team_id: team.team_id,
													team_name: team.team.name,
													is_active: team.is_active,
													is_delete: team.is_delete,
													no: team.no,
													users:
														team?.incidentTeamUsers?.map((user: any) => user?.user_id) ??
														[],
													usersSelected:
														team?.incidentTeamUsers?.map((user: any) => {
															return {
																user_id: user?.user_id,
																is_active: user?.user?.is_active,
																is_delete: user?.user?.is_delete
															}
														}) ?? [],
													teamAndUserOptions: mappingOption,
													checkBox: team?.incidentTeamUsers?.length > 0 ? true : false,
													ba: []
												})
											}
										}

										Object.assign(incidentForm, incidentManagementStore.incident, {
											formula: toRaw(
												incidentManagementStore.incident.incidentBrandAdvocacys
											).flatMap(
												(brand: any) => brand?.brandAdvocacy?.candidate?.candidateFormulas
											),
											date_post: incidentManagementStore.incident?.date_post
												? moment(incidentManagementStore.incident?.date_post).valueOf()
												: null,
											team_id:
												incidentManagementStore.incident?.incidentBrandAdvocacys[0]?.team?.id,
											candidate: candidate,
											formula_id: `${incidentManagementStore.incident.brand_id}_${incidentManagementStore.incident.formula_id}`
										})
										selectedCandidates.value = incidentForm.candidate.flatMap((team: any) => {
											return [team.team_id]
										})
										selectedBa.value.ba = incidentForm.candidate.flatMap((team: any) => {
											return team.ba
										})
										oldIncidentFormCandidate.value = _.cloneDeep(incidentForm.candidate)
										isModalManagement.value = true
										isModalManagement.event = MODAL_TYPE.EDIT
									}
								}),

							checkPermission(["im-manage-all", "im-case-create", "im-case-review"]) &&
								h(Icon, {
									icon: "tabler:trash",
									class: "w-6 h-6 cursor-pointer",
									onClick: () => {
										dialog.error({
											title: "ยืนยันการลบข้อมูล",
											content: `ข้อมูลที่ลบจะไม่สามารถกู้คืนได้
											 คุณแน่ใจที่จะลบข้อมูล Topic : ${row.topic} หรือไม่ ?`,
											positiveText: "แน่ใจ",
											negativeText: "ยกเลิก",
											onPositiveClick: async () => {
												pagination.page = 1
												await incidentManagementStore.deleteIncident(row.id)
												await incidentManagementStore.getIncidents({
													...pagination,
													...filterApi
												})
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
		const column = createColumns()
		const pagination = reactive({
			page: 1,
			limit: 10
		})
		const filterApi = reactive({
			filter: "",
			feedback_type: "",
			status_case: "",
			date: null
		})
		const paginateCount = computed(() => {
			const countPage = pagination.limit * pagination.page
			const totalTeams = incidentManagementStore?.incidents?.total ?? 0
			return countPage > totalTeams ? totalTeams : countPage
		})
		const itemCount = computed(() => {
			return incidentManagementStore?.incidents?.total || 0
		})
		const rules: FormRules = {}

		onMounted(async () => {
			await masterDataStore.getBrands()
			await masterDataStore.getSocial()
			await incidentManagementStore.getIncidents({ ...pagination, ...filterApi })
			await incidentManagementStore.getTeamAndBa()
			Object.assign(teamAndBa, {
				team_options: incidentManagementStore.teamAndBa.map((team: any) => ({
					label: team.name,
					value: team.id,
					ba: team?.teamBrandAdvocacy
						?.filter(
							(ba: any) =>
								ba.brandAdvocacy?.candidate?.firstname &&
								ba.brandAdvocacy?.candidate?.lastname &&
								ba.brandAdvocacy?.candidate?.id &&
								ba.brandAdvocacy?.candidate?.is_active === 1 &&
								ba.brandAdvocacy?.candidate?.is_delete === 0
						)
						.map((ba: any) => ({
							label: ba.brandAdvocacy?.candidate?.firstname + " " + ba.brandAdvocacy?.candidate?.lastname,
							value: ba?.brand_advocacy_id,
							team_id: team.id,
							team_name: team.name,
							is_active: ba.brandAdvocacy?.candidate?.is_active,
							is_delete: ba.brandAdvocacy?.candidate?.is_delete,
							topic: ba.brandAdvocacy?.candidate?.topic
						}))
				}))
			})

			brands.value = masterDataStore.brands
			socialOptions.value = masterDataStore.social.map(
				(social: { id: number; name: string; is_active: number; is_delete: number }) => ({
					value: social.id,
					label: social.name,
					is_active: social.is_active,
					is_delete: social.is_delete
				})
			)
			await teamManagementStore.getTeamAllEditBA()
			teamOptions.value = teamManagementStore.teamAllBA.data.map(
				(team: { id: number; name: string; is_active: number; is_delete: number }) => ({
					value: team.id,
					label: team.name,
					is_active: team.is_active,
					is_delete: team.is_delete
				})
			)
		})

		function handleCreateIncident(e: MouseEvent) {
			e.preventDefault()
			masterDataStore.getTopic()
			Object.assign(incidentForm, defaultValue)
			selectedCandidates.value = []

			isModalManagement.value = true
			isModalManagement.event = MODAL_TYPE.CREATE
		}
		function getTeamName(teamId: number) {
			const team = teamOptions.value.find((team: { value: number }) => team.value === teamId)
			return team ? team.label : ""
		}
		const override: TreeSelectOverrideNodeClickBehavior = ({ option }) => {
			if (option.children) {
				return "toggleExpand"
			}
			return "default"
		}

		const statusIncidentCase = computed(() => {
			const statusOption = INCIDENT_MANAGEMENT.CASE_OPTIONS.find(
				option => option.value === incidentForm.status_incident
			)
			return statusOption ? statusOption.label : "Unknown Status"
		})
		const statusIncidentType = computed(() => {
			const statusOption = INCIDENT_MANAGEMENT.INCIDENT_TYPE_OPTIONS.find(
				option => option.value === incidentForm.type_incident_before
			)
			return statusOption ? statusOption.label : "Unknown Status"
		})
		// Logic N-tree-select start
		const selectedCandidates = ref<(string | number)[]>([])
		function handleUpdateValue(
			value: Array<string | number | { id: number; name: string; point_case: number; team_id: number }>,
			option: any | null | Array<any | null>
		): void {
			if (isModalManagement.event !== MODAL_TYPE.EDIT && isModalManagement.event !== MODAL_TYPE.RANDOM) {
				Object.assign(incidentForm, {
					candidate: option?.map((item: any) => ({
						team_id: item.value,
						team_name: item.label,
						user: [],
						userSelected: [],
						ba: []
					}))
				})
			} else {
				const existingCandidates = oldIncidentFormCandidate.value.map((team: any) => {
					if (option.some((item: any) => item.value === team.team_id)) {
						return {
							...team,
							user: [],
							userSelected: [],
							is_active: 1,
							is_delete: 0,
							ba: team.ba.map((ba: any) => ({
								...ba,
								is_active: 1,
								is_delete: 0
							}))
						}
					} else {
						return {
							...team,
							is_active: 0,
							is_delete: 1,
							user: [],
							userSelected: [],
							ba: team.ba.map((ba: any) => ({
								...ba,
								is_active: 0,
								is_delete: 1
							}))
						}
					}
				})
				option.forEach((item: any) => {
					const existingTeam = existingCandidates.find((team: any) => team.team_id === item.value)
					if (!existingTeam) {
						existingCandidates.push({
							team_id: item.value,
							team_name: item.label,
							is_active: 1,
							is_delete: 0,
							user: [],
							userSelected: [],
							ba: []
						})
					}
				})

				Object.assign(incidentForm, {
					candidate: existingCandidates
				})
				oldIncidentFormCandidate.value = existingCandidates
			}
		}

		const selectedBa = ref<{
			team_id: number
			teamIndex: number
			key?: any[]
			ba: Ba[]
			candidateBa: any[]
			no: number | null
		}>({
			team_id: 0,
			teamIndex: 0,
			key: [],
			ba: [],
			candidateBa: [],
			no: 0
		})
		function handleUpdateValueBa(value: any, option: any) {
			if (isModalManagement.event !== MODAL_TYPE.EDIT && isModalManagement.event !== MODAL_TYPE.RANDOM) {
				selectedBa.value.ba = option.map((item: any) => ({
					name: item.label,
					point_case: "0",
					brand_advocacy_id: item.value,
					is_active: item.is_active,
					is_delete: item.is_delete,
					topic: item.topic
				}))
				incidentForm.candidate[selectedBa.value.teamIndex].ba = selectedBa.value.ba
			} else {
				const mappingData = oldIncidentFormCandidate.value.map((team: any) => {
					if (team.team_id === selectedBa.value.team_id) {
						const updatedBa = option.map((item: any) => {
							const existingBa = incidentForm.candidate[selectedBa.value.teamIndex].ba.find(
								(ba: any) => ba.brand_advocacy_id === item.value
							)
							return {
								name: item.label,
								point_case: "0",
								brand_advocacy_id: item.value,
								is_active: 1,
								is_delete: 0,
								topic: existingBa ? existingBa.topic : []
							}
						})

						team.ba.forEach((oldBa: any) => {
							const baExists = updatedBa.some(
								(newBa: any) => newBa.brand_advocacy_id === oldBa.brand_advocacy_id
							)
							if (!baExists) {
								updatedBa.push({
									name: oldBa.name,
									point_case: oldBa.point_case,
									brand_advocacy_id: oldBa.brand_advocacy_id,
									is_active: 0,
									is_delete: 1,
									topic: oldBa.topic
								})
							}
						})

						team.ba = updatedBa
					}
					return team
				})
				Object.assign(incidentForm, {
					candidate: mappingData
				})
			}
		}
		function updateFormula(value: string | number | Array<string | number> | null): void {
			if (typeof value === "string" && value.includes("_")) {
				const selectedOption = productOption.value
					.flatMap((option: any) => option.children || [])
					.find((child: any) => child.key === value)
				if (selectedOption) {
					incidentForm.brand_id = selectedOption.brand_id
				}
			} else if (typeof value === "number") {
				const selectedOption = productOption.value.find((option: any) => option.key === value)
				if (selectedOption) {
					incidentForm.brand_id = selectedOption.key
				}
			}
		}
		// Logic N-tree-select end
		async function createIncident() {
			const splitFormula = incidentForm.formula_id.toString().split("_")
			const body = {
				topic: incidentForm.topic,
				sentiment_type: incidentForm.sentiment_type,
				brand_id: Number(splitFormula[0]),
				formula_id: Number(splitFormula[1]),
				page_name: incidentForm.page_name,
				link_incident: incidentForm.link_incident,
				status_incident: incidentForm.status_incident,
				social_id: incidentForm.social_id,
				ba_type: incidentForm.ba_type,
				owner_link: incidentForm.owner_link,
				type_incident_before: incidentForm.type_incident_before,
				type_incident_after: incidentForm.type_incident_after,
				description_before: incidentForm.description_before,
				description_after: incidentForm.description_after,
				like_amount: incidentForm.like_amount,
				share_amount: incidentForm.share_amount,
				view_amount: incidentForm.view_amount,
				date_post: incidentForm.date_post ? moment(incidentForm.date_post).format("YYYY-MM-DD HH:mm:ss") : null,
				teams: incidentForm.candidate.map((team: any) => {
					return {
						team_id: team.team_id,
						users: team?.users?.map((user: any) => {
							return {
								user_id: user,
								is_active: 1,
								is_delete: 0
							}
						}),
						no: team.no ? team.no : 0
					}
				}),
				ba: incidentForm.candidate.flatMap((team: any) =>
					team.ba.map((ba: any) => {
						return {
							team_id: team.team_id,
							// eslint-disable-next-line no-constant-condition
							brand_advocacy_id: ba.brand_advocacy_id,
							topic: ba.topic
						}
					})
				)
			}
			await incidentManagementStore.createIncident(body)
			await incidentManagementStore.getIncidents({ ...pagination, ...filterApi })
			isModalManagement.value = false
		}
		function handleCloseSelectedBa() {
			selectedBa.value = {
				team_id: 0,
				teamIndex: 0,
				key: [],
				ba: [],
				candidateBa: [],
				no: selectedBa.value.no
			}
			isModalManagement.randomModal = false
		}
		async function updateIncident() {
			const splitFormula = incidentForm.formula_id.toString().split("_")
			const body = {
				incident_id: incidentForm.id,
				topic: incidentForm.topic,
				sentiment_type: incidentForm.sentiment_type,
				brand_id: Number(splitFormula[0]),
				formula_id: Number(splitFormula[1]),
				page_name: incidentForm.page_name,
				link_incident: incidentForm.link_incident,
				status_incident: incidentForm.status_incident,
				social_id: incidentForm.social_id,
				ba_type: incidentForm.ba_type,
				owner_link: incidentForm.owner_link,
				type_incident_before: incidentForm.type_incident_before,
				type_incident_after: incidentForm.type_incident_after,
				description_before: incidentForm.description_before,
				description_after: incidentForm.description_after,
				like_amount: incidentForm.like_amount,
				share_amount: incidentForm.share_amount,
				view_amount: incidentForm.view_amount,
				date_post: incidentForm.date_post ? moment(incidentForm.date_post).format("YYYY-MM-DD HH:mm:ss") : null,
				teams: incidentForm.candidate.map((team: any) => {
					return {
						team_id: team.team_id,
						users: team.usersSelected,
						no: team.no ? team.no : 0,
						is_active: team.is_active,
						is_delete: team.is_delete
					}
				}),
				ba: incidentForm.candidate.flatMap((team: any) =>
					team.ba
						.filter((ba: any) => ba.brand_advocacy_id)
						.map((ba: any) => {
							return {
								team_id: team.team_id,
								brand_advocacy_id: ba.brand_advocacy_id,
								is_active: ba.is_active,
								is_delete: ba.is_delete,
								point: Number(ba.point_case),
								topic: ba.topic
							}
						})
				)
			}

			if (incidentForm.status_incident === 1 || incidentForm.status_incident === 2) {
				await incidentManagementStore.updateIncident(body)
				await incidentManagementStore.getIncidents({ ...pagination, ...filterApi })
				isModalManagement.value = false
			} else {
				dialog.warning({
					title: "ยืนยันการแก้ไขข้อมูล",
					content: `ข้อมูลที่แก้ไขเมื่อ จ่าย Point แล้วจะอัพเดททุกๆ 02.30 น.(ตีสองครึ่ง) ของทุกวัน ยืนยันการแก้ไขข้อมูลของ Incident Case ${incidentForm.topic}  หรือไม่ ?`,
					positiveText: "ยืนยัน",
					negativeText: "ยกเลิก",
					onPositiveClick: async () => {
						await incidentManagementStore.updateIncident(body)
						await incidentManagementStore.getIncidents({ ...pagination, ...filterApi })
						isModalManagement.value = false
					},
					onNegativeClick: () => {
						isModalManagement.value = false
					}
				})
			}
		}
		function handleCancel() {
			Object.assign(incidentForm, defaultValue)
			selectedBa.value = {
				team_id: 0,
				teamIndex: 0,
				key: [],
				ba: [],
				candidateBa: [],
				no: 0
			}
			isModalManagement.value = false
		}
		const teamIndexOpenRandom = ref(0)
		function handleOpenModalRandom(teamId: number, teamIndex: number) {
			teamIndexOpenRandom.value = teamIndex

			selectedBa.value.no = incidentForm.candidate[teamIndex].no

			selectedBa.value = {
				...selectedBa.value,
				team_id: teamId,
				teamIndex: teamIndex,
				ba: incidentForm.candidate.flatMap((team: any) =>
					team.ba.map((ba: any) => ({
						team_id: team.team_id,
						brand_advocacy_id: ba.brand_advocacy_id,
						is_active: ba.is_active,
						is_delete: ba.is_delete,
						topic: ba.topic
					}))
				)
			}

			selectedBa.value.key = selectedBa.value.ba
				.filter((ba: any) => ba.team_id === teamId && ba.is_delete !== 1)
				.map((ba: any) => ba.brand_advocacy_id)
			isModalManagement.randomModal = true
		}
		function handleUpdateValueBaNo(value: number) {
			incidentForm.candidate[teamIndexOpenRandom.value].no = value
		}
		function deleteBaWithIndex(teamIndex: number, baIndex: number, checkActive: boolean) {
			if (checkActive) {
				incidentForm.candidate[teamIndex].ba[baIndex].is_active = 0
				incidentForm.candidate[teamIndex].ba[baIndex].is_delete = 1
				incidentForm.candidate[teamIndex].ba[baIndex].topic = []
				selectedCandidates.value = incidentForm.candidate.flatMap((team: any) => {
					return [team.team_id]
				})
			} else if (incidentForm.candidate[teamIndex] && incidentForm.candidate[teamIndex].ba) {
				incidentForm.candidate[teamIndex].ba.splice(baIndex, 1)
				selectedCandidates.value = incidentForm.candidate.flatMap((team: any) => {
					return [team.team_id]
				})
			} else {
				console.error("Invalid teamIndex or baIndex")
			}
		}
		function deleteTeamWithIndex(teamId: number, teamIndex: number, checkActive: boolean) {
			if (checkActive) {
				incidentForm.candidate[teamIndex].ba.forEach((ba: any) => {
					ba.is_active = 0
					ba.is_delete = 1
					ba.topic = []
				})
				incidentForm.candidate[teamIndex].usersSelected.forEach((user: any) => {
					user.is_active = 0
					user.is_delete = 1
				})
				incidentForm.candidate[teamIndex].is_active = 0
				incidentForm.candidate[teamIndex].is_delete = 1
			} else if (incidentForm.candidate[teamIndex]) {
				incidentForm.candidate.splice(teamIndex, 1)
			} else {
				console.error("Invalid teamIndex")
				return
			}

			selectedCandidates.value = selectedCandidates.value.filter((id: any) => id !== teamId)
		}

		const handleSearch = _.debounce((value: string, type: string) => {
			if (type === "input") {
				filterApi.filter = value
			} else if (type === "feedback_type") {
				filterApi.feedback_type = value
			} else if (type === "status_case") {
				filterApi.status_case = value
			}
		}, 500)

		function createRequestBody() {
			const body: any = {
				...pagination,
				filter: filterApi.filter,
				feedback_type: filterApi.feedback_type,
				status_case: filterApi.status_case
			}

			if (filterApi.date !== null) {
				body.startdate = moment(filterApi.date[0]).format("YYYY-MM-DD HH:mm:ss")
				body.enddate = moment(filterApi.date[1]).format("YYYY-MM-DD HH:mm:ss")
			}

			return body
		}

		async function fetchIncidents() {
			const body = createRequestBody()
			await incidentManagementStore.getIncidents(body)
		}

		watch(filterApi, async value => {
			pagination.page = 1
			await fetchIncidents()
		})
		watch(pagination, fetchIncidents)

		async function handleExportIncident() {
			if (filterApi.date !== null) {
				const params = {
					startdate: moment(filterApi.date[0]).format("YYYY-MM-DD HH:mm:ss"),
					enddate: moment(filterApi.date[1]).format("YYYY-MM-DD HH:mm:ss")
				}
				window.open(
					`${import.meta.env.VITE_API_URL_BA_APP}api/v1/incident-management/export/?startdate=${params.startdate}&enddate=${params.enddate}`
				)
			} else {
				window.open(`${import.meta.env.VITE_API_URL_BA_APP}api/v1/incident-management/export/`)
			}
		}
		const numberOfBaOptions = Array.from({ length: 51 }, (_, i) => ({
			label: `${i} BA`,
			value: i
		}))

		async function handleCheckboxChange(value: boolean, teamId: number) {
			const team = incidentForm.candidate.find((team: any) => team.team_id === teamId)
			if (!team) {
				console.error("Invalid teamId")
				return
			}

			team.checkBox = value
			const params = {
				team_id: teamId
			}

			if (team.checkBox) {
				const res = await incidentManagementStore.getTeamUsers(params)
				const mappingOption = res?.map((item: any) => ({
					value: item?.user?.id,
					label: `${item?.user?.firstname} ${item?.user?.lastname}`
				}))

				team.teamAndUserOptions = mappingOption
			} else {
				if (isModalManagement.event === MODAL_TYPE.EDIT) {
					team.usersSelected = team.usersSelected.map((user: any) => {
						return {
							user_id: user.user_id,
							is_active: 0,
							is_delete: 1
						}
					})
				} else {
					console.error("Invalid event")
					team.usersSelected = []
					team.teamAndUserOptions = []
					team.users = []
				}
			}
		}
		function handleAssignUsers(value: any, teamIndex: number) {
			const item = incidentForm.candidate[teamIndex]

			// Ensure usersSelected is defined
			if (!item.usersSelected) {
				item.usersSelected = []
			}

			const selectedUsers = value.map((userId: number) => {
				return {
					user_id: userId,
					is_active: 1,
					is_delete: 0
				}
			})

			const unselectedUsers = item.usersSelected
				.filter((user: any) => !value.includes(user.user_id))
				.map((user: any) => {
					return {
						user_id: user.user_id,
						is_active: 0,
						is_delete: 1
					}
				})

			// Update usersSelected
			incidentForm.candidate[teamIndex].usersSelected = [...selectedUsers, ...unselectedUsers]
		}
		return {
			showModalRef,
			checkedRowKeysRef,
			rowKey: (row: RowData) => row.name,
			handleCheck(rowKeys: DataTableRowKey[]) {
				checkedRowKeysRef.value = rowKeys
			},
			column,
			PAGE_SIZES,
			pagination,
			paginateCount,
			itemCount,
			incidentForm,
			isModalManagement,
			titleModal,
			MODAL_TYPE,
			formRef,
			rules,
			handleCreateIncident,
			INCIDENT_MANAGEMENT,
			renderMultipleSelectTag,
			renderLabel,
			brandOption,
			productOption,
			teamOptions,
			override,
			socialOptions,
			getTeamName,
			incidentManagementStore,
			statusIncidentCase,
			statusIncidentType,
			teamAndBa,
			handleUpdateValue,
			createIncident,
			selectedCandidates,
			renderMultipleSelectTagPoint,
			handleOpenModalRandom,
			randomBaOptions,
			handleCancel,
			updateFormula,
			renderSelectTypeFeedback,
			renderLabelTypeFeedback,
			renderLabelCase,
			renderSelectCase,
			updateIncident,
			deleteBaWithIndex,
			deleteTeamWithIndex,
			handleSearch,
			checkPermission,
			handleUpdateValueBa,
			selectedBa,
			handleCloseSelectedBa,
			filterApi,
			handleExportIncident,
			numberOfBaOptions,
			handleUpdateValueBaNo,
			topicsOption,
			handleCheckboxChange,
			handleAssignUsers
		}
	}
})
</script>
<style scoped>
h4 {
	@apply text-[#2B405B];
}
.n-base-select-menu .n-base-select-option .n-base-select-option__content {
	width: 100%;
}

#selection-multiple .n-base-close.n-base-close--absolute {
	left: 10px;
}
</style>
