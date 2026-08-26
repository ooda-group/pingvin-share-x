import { Button, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useModals } from "@mantine/modals";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import * as yup from "yup";
import useTranslate from "../../../hooks/useTranslate.hook";
import shareService from "../../../services/share.service";
import { FileUpload } from "../../../types/File.type";
import { CreateShare } from "../../../types/share.type";
import { generateShareId } from "../../../utils/share.util";
import toast from "../../../utils/toast.util";

const generateAvailableLink = async (
  shareIdLength: number,
  times: number = 10,
): Promise<string> => {
  if (times <= 0) {
    throw new Error("Could not generate available link");
  }

  const link = generateShareId(shareIdLength);
  if (!(await shareService.isShareIdAvailable(link))) {
    return generateAvailableLink(shareIdLength, times - 1);
  }

  return link;
};

const showCreateReverseUploadModal = (
  modals: ModalsContextProps,
  shareIdLength: number,
  files: FileUpload[],
  uploadCallback: (createShare: CreateShare, files: FileUpload[]) => void,
) => {
  return modals.openModal({
    title: "Send files to OODA Group",
    children: (
      <Body
        shareIdLength={shareIdLength}
        files={files}
        uploadCallback={uploadCallback}
      />
    ),
  });
};

const Body = ({
  shareIdLength,
  files,
  uploadCallback,
}: {
  shareIdLength: number;
  files: FileUpload[];
  uploadCallback: (createShare: CreateShare, files: FileUpload[]) => void;
}) => {
  const modals = useModals();
  const t = useTranslate();

  const form = useForm({
    initialValues: {
      name: undefined,
      description: undefined,
    },
    validate: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .transform((value) => value || undefined)
          .min(3, t("common.error.too-short", { length: 3 }))
          .max(30, t("common.error.too-long", { length: 30 })),
      }),
    ),
  });

  const onSubmit = form.onSubmit(async (values) => {
    const link = await generateAvailableLink(shareIdLength).catch(() => {
      toast.error(t("upload.modal.link.error.taken"));
      return undefined;
    });

    if (!link) return;

    uploadCallback(
      {
        id: link,
        name: values.name,
        expiration: "never",
        recipients: [],
        description: values.description,
        security: {
          password: undefined,
          maxViews: undefined,
        },
      },
      files,
    );
    modals.closeAll();
  });

  return (
    <form onSubmit={onSubmit}>
      <Stack align="stretch">
        <TextInput
          variant="filled"
          placeholder={t(
            "upload.modal.accordion.name-and-description.name.placeholder",
          )}
          {...form.getInputProps("name")}
        />
        <Textarea
          variant="filled"
          placeholder={t(
            "upload.modal.accordion.name-and-description.description.placeholder",
          )}
          {...form.getInputProps("description")}
        />
        <Button type="submit" data-autofocus fullWidth>
          Send files to OODA Group
        </Button>
      </Stack>
    </form>
  );
};

export default showCreateReverseUploadModal;
