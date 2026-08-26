import { Burger, Button, Group, Header, MediaQuery, Text } from "@mantine/core";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { FormattedMessage } from "react-intl";
import useConfig from "../../../hooks/config.hook";
import Logo from "../../Logo";
import ActionAvatar from "../../header/ActionAvatar";
import NavbarShareMenu from "../../header/NavbarShareMenu";

const ConfigurationHeader = ({
  isMobileNavBarOpened,
  setIsMobileNavBarOpened,
}: {
  isMobileNavBarOpened: boolean;
  setIsMobileNavBarOpened: Dispatch<SetStateAction<boolean>>;
}) => {
  const config = useConfig();
  return (
    <Header height={60} p="md" style={{ zIndex: 2 }}>
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <Group position="apart" w="100%" noWrap>
          <Link href="/" passHref>
            <Group noWrap>
              <Logo height={35} width={35} />
              <Text weight={600}>{config.get("general.appName")}</Text>
            </Group>
          </Link>

          <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
            <Group spacing={5} noWrap>
              <Button variant="subtle" component={Link} href="/upload">
                <FormattedMessage id="navbar.upload" />
              </Button>
              <NavbarShareMenu />
              <ActionAvatar />
              <Button variant="light" component={Link} href="/admin">
                <FormattedMessage id="common.button.go-back" />
              </Button>
            </Group>
          </MediaQuery>

          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Group spacing={8} noWrap>
              <NavbarShareMenu />
              <ActionAvatar />
              <Burger
                opened={isMobileNavBarOpened}
                onClick={() => setIsMobileNavBarOpened((o) => !o)}
                size="sm"
              />
            </Group>
          </MediaQuery>
        </Group>
      </div>
    </Header>
  );
};

export default ConfigurationHeader;
