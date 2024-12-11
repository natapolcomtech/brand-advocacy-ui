import type { SelectRenderTag, SelectRenderLabel } from "naive-ui"
import { NTag, NButton } from "naive-ui"
import { h } from "vue"
const renderMultipleSelectTag: SelectRenderTag = ({ option, handleClose }) => {
	return h(
		NTag,
		{
			style: {
				padding: "10px 20px 10px 20px"
			},
			class: "!bg-[#337BE2] ",
			round: true,
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
						class: "flex items-center text-white"
					},
					[option.label as string]
				)
		}
	)
}
const renderMultipleSelectTagPoint: SelectRenderTag = ({ option, handleClose }) => {
	return h(
		NTag,
		{
			style: {
				padding: "10px 20px 10px 20px"
			},
			class: "!bg-[#337BE2] ",
			round: true,
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
						class: "flex items-center text-white"
					},
					[
						option.label as string,
						h(
							NButton,
							{
								size: "tiny",
								type: "error",
								circle: true,
								class: "!text-[8px] !ml-4 !w-[16px] !h-[16px] !text-center",
								onClick: e => {
									e.stopPropagation()
								}
							},
							{
								default: () => option.totalJob
							}
						)
					]
				)
		}
	)
}
const renderSelectTypeFeedback: SelectRenderTag = ({ option, handleClose }) => {
	return h(
		NTag,
		{
			style: { padding: "10px 20px" },
			round: true,
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
						class: [
							"flex items-center",
							option.value === 1
								? "!text-[#209788]"
								: option.value === 3
									? "!text-[#FF6D83]"
									: "!text-[#2B405B]"
						].join(" ")
					},
					[option.label as string]
				)
		}
	)
}
const renderLabelTypeFeedback: SelectRenderLabel = option => {
	return h(
		NTag,
		{
			round: true
		},
		h(
			"div",
			{
				class: [
					"flex items-center",
					option.value === 1 ? "!text-[#209788]" : option.value === 3 ? "!text-[#FF6D83]" : "!text-[#2B405B]"
				].join(" ")
			},
			[option.label as string]
		)
	)
}
const renderLabel: SelectRenderLabel = option => {
	return h(
		NTag,
		{
			style: {
				padding: "10px 20px 10px 20px"
			},
			class: "!bg-[#337BE2] ",
			round: true
		},
		h(
			"div",
			{
				class: "flex items-center text-white"
			},
			[option.label as string]
		)
	)
}
const renderLabelCase: SelectRenderLabel = option => {
	return h(
		NTag,
		{
			style: {
				padding: "10px 20px 10px 20px"
			},
			class: [
				"flex items-center text-white",
				option.value === 1 ? "!bg-[#3860FF]" : option.value === 3 ? "!bg-[#FE4C4C]" : "!bg-[#2B405B]"
			].join(" "),
			round: true
		},
		h(
			"div",
			{
				class: ["flex items-center text-white"]
			},
			[option.label as string]
		)
	)
}
const renderSelectCase: SelectRenderTag = ({ option, handleClose }) => {
	return h(
		NTag,
		{
			style: {
				padding: "10px 20px"
			},
			class: [
				"flex items-center",
				option.value === 1 ? "!bg-[#3860FF]" : option.value === 3 ? "!bg-[#FE4C4C]" : "!bg-[#2B405B]"
			].join(" "),
			round: true,
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
						class: ["flex items-center text-white"]
					},
					[option.label as string]
				)
		}
	)
}
export {
	renderMultipleSelectTag,
	renderMultipleSelectTagPoint,
	renderSelectTypeFeedback,
	renderLabelTypeFeedback,
	renderLabel,
	renderSelectCase,
	renderLabelCase
}
