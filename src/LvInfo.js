import React, { useState, useRef } from 'react';

import './LvInfo.scss';

import { Chip } from '@material/react-chips';
import MaterialIcon from '@material/react-material-icon';
import MenuSurface from '@material/react-menu-surface';

import LvInput from './LvInput';

const LvInfo = (props) => {
  const [inputOpen, setInputOpen] = useState(false);
  const inputAnchor = useRef(null);

  return (
    <span
      className="mdc-menu-surface--anchor lv-info"
      ref={inputAnchor}
      id={props.lv ? props.lv.uid : "und-000"}
    >
      <Chip
        label={props.lv.name_expr_txt}
        id={props.lv.uid || "und-000"}
        onClick={() => setInputOpen(true)}
        leadingIcon={<MaterialIcon icon="expand_more" />}
      />
      <span className="mdc-typography--caption other-names">
        {props.lv.otherNames &&
          props.lv.otherNames.slice(0, 3).join(' — ')
        }
      </span>
      <MenuSurface
        anchorElement={inputAnchor.current}

        open={inputOpen}
        onClose={() => setInputOpen(false)}
      >
        <LvInput
          label={props.label}
          interfaceLangvar={props.interfaceLangvar}
          onNewRequest={props.onNewRequest}
        />
      </MenuSurface>
    </span>
  );
};

export default LvInfo;