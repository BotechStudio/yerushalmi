import DemoContent from '@fuse/core/DemoContent';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import ProductsHeader from './ProductsHeader';
import ProductsTable from './ProductsTable';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

/**
 * The Diamonds page.
 */
function Diamonds() {
	// const { t } = useTranslation('DiamondsPage');
	return (
		<Root
			header={
				<div className="p-24">
					<ProductsHeader />
				</div>
			}
			content={
				<div className="p-24">
					<GlobalStyles
						styles={() => ({
							'#root': {
								maxHeight: '100vh'
							}
						})}
					/>
					<div className="w-full h-full container flex flex-col">
						<ProductsTable />
					</div>
				</div>
			}
		/>
	);
}

export default Diamonds;