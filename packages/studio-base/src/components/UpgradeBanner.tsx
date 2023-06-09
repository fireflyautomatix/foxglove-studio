// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Dismiss20Regular } from "@fluentui/react-icons";
import { Alert, IconButton, Link } from "@mui/material";
import { makeStyles } from "tss-react/mui";

import { AppSetting } from "@foxglove/studio-base/AppSetting";
import {
  WorkspaceContextStore,
  useWorkspaceStore,
} from "@foxglove/studio-base/context/Workspace/WorkspaceContext";
import { useWorkspaceActions } from "@foxglove/studio-base/context/Workspace/useWorkspaceActions";
import { useAppConfigurationValue } from "@foxglove/studio-base/hooks";

const useStyles = makeStyles()((theme) => ({
  root: {
    borderBottom: `1px solid ${theme.palette.divider}}`,
    justifyContent: "center",
    padding: 0,
  },
}));

const selectWorkspaceNewUIBanner = (store: WorkspaceContextStore) => store.banners.newUI;

export function UpgradeBanner(): JSX.Element | ReactNull {
  const { classes } = useStyles();
  const [_, setEnableNewTopNav] = useAppConfigurationValue(AppSetting.ENABLE_NEW_TOPNAV);

  const newUiBanner = useWorkspaceStore(selectWorkspaceNewUIBanner);
  const { bannerActions } = useWorkspaceActions();

  if (newUiBanner.dismissed) {
    return ReactNull;
  }

  return (
    <Alert
      color="info"
      className={classes.root}
      icon={false}
      action={
        <IconButton onClick={bannerActions.newUI.dismiss}>
          <Dismiss20Regular />
        </IconButton>
      }
    >
      This UI is being deprecated!
      <Link onClick={async () => await setEnableNewTopNav(true)} color="inherit">
        Upgrade Now
      </Link>
    </Alert>
  );
}
