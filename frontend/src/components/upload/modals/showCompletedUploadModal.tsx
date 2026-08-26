import { Button, Stack, Text, Collapse } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import { useState } from "react";
import moment from "moment";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import useTranslate, {
  translateOutsideContext,
} from "../../../hooks/useTranslate.hook";
import { CompletedShare } from "../../../types/share.type";
import CopyTextField from "../CopyTextField";
import QRCode from "../../share/QRCode";

const showCompletedUploadModal = (
  modals: ModalsContextProps,
  share: CompletedShare,
  appUrl: string,
  defaultAppUrl: string,
  isReverseShare = false,
) => {
  const t = translateOutsideContext();
  return modals.openModal({
    closeOnClickOutside: false,
    withCloseButton: false,
    closeOnEscape: false,
    title: isReverseShare
      ? "Files sent to OODA Group"
      : t("upload.modal.completed.share-ready"),
    children: (
      <Body
        share={share}
        appUrl={appUrl}
        defaultAppUrl={defaultAppUrl}
        isReverseShare={isReverseShare}
      />
    ),
  });
};

const Body = ({
  share,
  appUrl,
  defaultAppUrl,
  isReverseShare,
}: {
  share: CompletedShare;
  appUrl: string;
  defaultAppUrl: string;
  isReverseShare: boolean;
}) => {
  const modals = useModals();
  const router = useRouter();
  const t = useTranslate();

  const [showQR, setShowQR] = useState(false);

  const handleToggleQR = () => {
    setShowQR(!showQR);
  };

  const link = `${appUrl !== defaultAppUrl ? appUrl : window.location.origin}/s/${share.id}`;

  const handleDone = () => {
    modals.closeAll();
    if (isReverseShare) {
      router.reload();
    } else {
      router.push("/upload");
    }
  };

  if (isReverseShare) {
    return (
      <Stack align="stretch">
        <Text size="sm" align="center">
          Your files were uploaded successfully and sent securely to OODA Group.
        </Text>
        {share.notifyReverseShareCreator === true && (
          <Text size="sm" align="center" color="dimmed">
            {t("upload.modal.completed.notified-reverse-share-creator")}
          </Text>
        )}
        <Button onClick={handleDone}>
          <FormattedMessage id="common.button.done" />
        </Button>
      </Stack>
    );
  }

  return (
    <Stack align="stretch">
      <CopyTextField link={link} toggleQR={handleToggleQR} />
      <Collapse in={showQR}>
        <QRCode link={link} />
      </Collapse>
      {share.notifyReverseShareCreator === true && (
        <Text
          size="sm"
          sx={(theme) => ({
            color:
              theme.colorScheme === "dark"
                ? theme.colors.gray[3]
                : theme.colors.dark[4],
          })}
        >
          {t("upload.modal.completed.notified-reverse-share-creator")}
        </Text>
      )}
      <Text
        size="xs"
        sx={(theme) => ({
          color: theme.colors.gray[6],
        })}
      >
        {/* If our share.expiration is timestamp 0, show a different message */}
        {moment(share.expiration).unix() === 0
          ? t("upload.modal.completed.never-expires")
          : t("upload.modal.completed.expires-on", {
              expiration: moment(share.expiration).format("LLL"),
            })}
      </Text>

      <Button onClick={handleDone}>
        <FormattedMessage id="common.button.done" />
      </Button>
    </Stack>
  );
};

export default showCompletedUploadModal;
