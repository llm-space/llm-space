using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using System.Windows.Forms;

internal static class WindowsInstaller
{
    private const string AppName = "LLM Space";
    private const string CoreResourceName = "ElectrobunSetupCore";
    private const string MetadataResourceName = "ElectrobunSetupMetadata";
    private const string ArchiveResourceName = "ElectrobunSetupArchive";

    [STAThread]
    private static int Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        using (InstallerForm form = new InstallerForm())
        {
            Application.Run(form);
            return form.ExitCode;
        }
    }

    private sealed class InstallerForm : Form
    {
        private readonly Label statusLabel;
        private readonly ProgressBar progressBar;
        private Process coreProcess;
        private string coreDirectory;
        private volatile bool cancelRequested;
        private bool finished;

        internal InstallerForm()
        {
            ExitCode = 1;
            Text = AppName + " Setup";
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
            ClientSize = new Size(420, 132);
            AutoScaleMode = AutoScaleMode.Dpi;
            BackColor = SystemColors.Window;
            Padding = new Padding(28, 24, 28, 22);

            Icon executableIcon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
            if (executableIcon != null)
            {
                Icon = executableIcon;
            }

            statusLabel = new Label
            {
                AutoSize = false,
                Dock = DockStyle.Top,
                Height = 42,
                Text = "Installing " + AppName + "…",
                Font = new Font(SystemFonts.MessageBoxFont.FontFamily, 12F, FontStyle.Regular),
                ForeColor = SystemColors.WindowText,
                TextAlign = ContentAlignment.MiddleLeft,
            };
            progressBar = new ProgressBar
            {
                Dock = DockStyle.Top,
                Height = 18,
                Style = ProgressBarStyle.Marquee,
                MarqueeAnimationSpeed = 28,
            };

            Controls.Add(progressBar);
            Controls.Add(statusLabel);
            Shown += OnShown;
            FormClosing += OnFormClosing;
        }

        internal int ExitCode { get; private set; }

        private async void OnShown(object sender, EventArgs args)
        {
            int exitCode;
            try
            {
                exitCode = await Task.Run(() => RunCoreInstaller());
            }
            catch (Exception error)
            {
                if (cancelRequested)
                {
                    FinishAndClose(2);
                    return;
                }

                MessageBox.Show(
                    this,
                    "Installation failed.\n\n" + error.Message,
                    AppName + " Setup",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                FinishAndClose(1);
                return;
            }

            if (cancelRequested)
            {
                FinishAndClose(2);
                return;
            }

            if (exitCode != 0)
            {
                MessageBox.Show(
                    this,
                    "Installation failed with exit code " + exitCode + ".",
                    AppName + " Setup",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                FinishAndClose(exitCode);
                return;
            }

            progressBar.Style = ProgressBarStyle.Continuous;
            progressBar.MarqueeAnimationSpeed = 0;
            progressBar.Value = 100;
            statusLabel.Text = "Installation complete";
            await Task.Delay(700);
            FinishAndClose(0);
        }

        private int RunCoreInstaller()
        {
            string installerDirectory = AppDomain.CurrentDomain.BaseDirectory;
            string setupFileName = Path.GetFileName(Application.ExecutablePath);
            string setupStem = Path.GetFileNameWithoutExtension(setupFileName);
            coreDirectory = Path.Combine(
                installerDirectory,
                ".llm-space-setup-" + Guid.NewGuid().ToString("N")
            );
            string coreInstallerDirectory = Path.Combine(coreDirectory, ".installer");
            string corePath = Path.Combine(coreDirectory, setupFileName);

            try
            {
                Directory.CreateDirectory(coreInstallerDirectory);
                File.SetAttributes(
                    coreDirectory,
                    File.GetAttributes(coreDirectory) | FileAttributes.Hidden
                );
                ExtractResource(CoreResourceName, corePath);
                ExtractResource(
                    MetadataResourceName,
                    Path.Combine(coreInstallerDirectory, setupStem + ".metadata.json")
                );
                ExtractResource(
                    ArchiveResourceName,
                    Path.Combine(coreInstallerDirectory, setupStem + ".tar.zst")
                );

                if (cancelRequested)
                {
                    return 2;
                }

                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    FileName = corePath,
                    WorkingDirectory = coreDirectory,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = ProcessWindowStyle.Hidden,
                };

                using (Process process = new Process { StartInfo = startInfo })
                {
                    coreProcess = process;
                    if (!process.Start())
                    {
                        return 3;
                    }
                    if (cancelRequested && !process.HasExited)
                    {
                        process.Kill();
                    }
                    process.WaitForExit();
                    return process.ExitCode;
                }
            }
            finally
            {
                coreProcess = null;
                TryDeleteCoreDirectory();
            }
        }

        private static void ExtractResource(string resourceName, string destination)
        {
            Assembly assembly = Assembly.GetExecutingAssembly();
            using (Stream input = assembly.GetManifestResourceStream(resourceName))
            {
                if (input == null)
                {
                    throw new InvalidOperationException(
                        "Embedded installer payload is missing: " + resourceName
                    );
                }
                using (FileStream output = new FileStream(destination, FileMode.Create, FileAccess.Write, FileShare.Read))
                {
                    input.CopyTo(output);
                }
            }
        }

        private void OnFormClosing(object sender, FormClosingEventArgs args)
        {
            if (finished)
            {
                return;
            }

            args.Cancel = true;
            if (cancelRequested)
            {
                return;
            }

            DialogResult result = MessageBox.Show(
                this,
                "Cancel the installation?",
                AppName + " Setup",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question
            );
            if (result != DialogResult.Yes)
            {
                return;
            }

            cancelRequested = true;
            statusLabel.Text = "Cancelling installation…";
            progressBar.MarqueeAnimationSpeed = 0;
            Process process = coreProcess;
            if (process != null && !process.HasExited)
            {
                try
                {
                    process.Kill();
                }
                catch (InvalidOperationException)
                {
                }
            }
        }

        private void FinishAndClose(int exitCode)
        {
            ExitCode = exitCode;
            finished = true;
            Close();
        }

        private void TryDeleteCoreDirectory()
        {
            if (String.IsNullOrEmpty(coreDirectory))
            {
                return;
            }
            try
            {
                Directory.Delete(coreDirectory, true);
            }
            catch
            {
            }
        }
    }
}
