import { Menu } from '@grammyjs/menu';
import { BANKS, MSG } from '../../../constants';
import { addPaymentDetails, getPaymentDetails } from '../../../mongodb/operations/users';

export const updatePaymentDetailsMenu = new Menu('updatePaymentDetailsMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text('check', async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        await getPaymentDetails(id);
    })
    .text('add', async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        
        await addPaymentDetails({
            userId: Number(id),
            bank: BANKS.PrivatBank,
            card: 12133131
        });
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.admin(user));
    });
